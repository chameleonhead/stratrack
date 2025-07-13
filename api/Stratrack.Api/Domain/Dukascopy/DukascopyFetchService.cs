using EventFlow;
using EventFlow.Queries;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using Stratrack.Api.Domain.DataSources;
using Stratrack.Api.Domain.DataSources.Commands;
using Stratrack.Api.Domain.DataSources.Queries;
using Stratrack.Api.Domain.Dukascopy.Commands;
using Stratrack.Api.Domain.Dukascopy.Queries;
using System.Threading;
using System.Threading.Tasks;
using Stratrack.Api.Domain.Blobs;

namespace Stratrack.Api.Domain.Dukascopy;

public class DukascopyFetchService(
    IDukascopyClient client,
    IQueryProcessor queryProcessor,
    IBlobStorage blobStorage,
    ICommandBus commandBus,
    ILogger<DukascopyFetchService> logger
)
{
    private readonly IDukascopyClient _client = client;
    private readonly IQueryProcessor _queryProcessor = queryProcessor;
    private readonly IBlobStorage _blobStorage = blobStorage;
    private readonly ICommandBus _commandBus = commandBus;
    private readonly ILogger<DukascopyFetchService> _logger = logger;

    internal static DateTimeOffset? ParseTimeFromUrl(string url)
    {
        try
        {
            var uri = new Uri(url);
            var parts = uri.AbsolutePath.Trim('/').Split('/');
            if (parts.Length < 6)
            {
                return null;
            }
            var year = int.Parse(parts[^4]);
            var month = int.Parse(parts[^3]);
            var day = int.Parse(parts[^2]);
            var hourPart = parts[^1].Split('h')[0];
            var hour = int.Parse(hourPart);
            return new DateTimeOffset(year, month, day, hour, 0, 0, TimeSpan.Zero);
        }
        catch
        {
            return null;
        }
    }

    public async Task FetchHourAsync(Guid jobId, Guid dataSourceId, string symbol, DateTimeOffset time, Guid executionId, CancellationToken token)
    {
        var success = false;
        string? error = null;
        DukascopyFetchResult result = new();
        var sw = System.Diagnostics.Stopwatch.StartNew();
        try
        {
            var ds = await _queryProcessor.ProcessAsync(new ReadModelByIdQuery<DataSourceReadModel>(DataSourceId.With(dataSourceId)), token).ConfigureAwait(false);
            if (ds == null)
            {
                _logger.LogWarning("Data source {DataSourceId} not found", dataSourceId);
                return;
            }

            result = await _client.GetTickDataAsync(symbol, time, token).ConfigureAwait(false);
            if (result.Data != null && result.Data.Length > 0)
            {
                var blobId = await _blobStorage.SaveAsync($"{symbol}_{time:yyyyMMddHH}.csv", "text/csv", result.Data, token).ConfigureAwait(false);
                await _commandBus.PublishAsync(new DataChunkRegisterCommand(DataSourceId.With(ds.DataSourceId))
                {
                    DataChunkId = Guid.NewGuid(),
                    BlobId = blobId,
                    StartTime = time,
                    EndTime = time.AddHours(1)
                }, token).ConfigureAwait(false);
            }

            success = result.HttpStatus == 200 || result.HttpStatus == 404;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch dukascopy chunk");
            error = ex.Message;
            throw;
        }
        finally
        {
            sw.Stop();
            await _commandBus.PublishAsync(new DukascopyJobRecordFetchResultCommand(DukascopyJobId.With(jobId))
            {
                ExecutionId = executionId,
                ExecutedAt = DateTimeOffset.UtcNow,
                IsSuccess = success,
                Symbol = symbol,
                TargetTime = time,
                FileUrl = result.Url,
                HttpStatus = result.HttpStatus,
                ETag = result.ETag,
                LastModified = result.LastModified,
                ErrorMessage = error,
                Duration = sw.Elapsed.TotalMilliseconds
            }, token).ConfigureAwait(false);
        }
    }

    public async Task FetchAsync(Guid jobId, Guid dataSourceId, string symbol, DateTimeOffset startTime, CancellationToken token)
    {
        var success = false;
        string? error = null;
        var sw = System.Diagnostics.Stopwatch.StartNew();
        try
        {
            var ds = await _queryProcessor.ProcessAsync(new ReadModelByIdQuery<DataSourceReadModel>(DataSourceId.With(dataSourceId)), token).ConfigureAwait(false);
            if (ds == null)
            {
                _logger.LogWarning("Data source {DataSourceId} not found", dataSourceId);
                return;
            }

            await ProcessSourceAsync(jobId, ds, startTime, token).ConfigureAwait(false);
            success = true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process dukascopy fetch");
            error = ex.Message;
        }
        finally
        {
            sw.Stop();
            await _commandBus.PublishAsync(new DukascopyJobRecordFetchResultCommand(DukascopyJobId.With(jobId))
            {
                ExecutedAt = DateTimeOffset.UtcNow,
                IsSuccess = success,
                Symbol = symbol,
                TargetTime = startTime,
                FileUrl = string.Empty,
                HttpStatus = 0,
                ETag = null,
                LastModified = null,
                ErrorMessage = error,
                Duration = sw.Elapsed.TotalMilliseconds
            }, token).ConfigureAwait(false);
        }
    }

    private async Task ProcessSourceAsync(Guid jobId, DataSourceReadModel ds, DateTimeOffset startTime, CancellationToken token)
    {
        var results = await _queryProcessor
            .ProcessAsync(new DukascopyJobFetchResultReadModelSearchQuery(jobId, null), token)
            .ConfigureAwait(false);

        var successTimes = results
            .Where(r => r.LastModified.HasValue && (r.HttpStatus == 200 || r.HttpStatus == 404))
            .Select(r => ParseTimeFromUrl(r.FileUrl))
            .Where(t => t.HasValue)
            .Select(t => t!.Value)
            .ToHashSet();

        var maxTime = DateTimeOffset.UtcNow.AddHours(-1);
        var current = startTime;
        while (current <= maxTime)
        {
            if (successTimes.Contains(current))
            {
                current = current.AddHours(1);
                continue;
            }

            var result = await _client.GetTickDataAsync(ds.Symbol, current, token).ConfigureAwait(false);
            if (result.Data != null && result.Data.Length > 0)
            {
                var blobId = await _blobStorage.SaveAsync(
                    $"{ds.Symbol}_{current:yyyyMMddHH}.csv",
                    "text/csv",
                    result.Data,
                    token).ConfigureAwait(false);
                await _commandBus.PublishAsync(new DataChunkRegisterCommand(DataSourceId.With(ds.DataSourceId))
                {
                    DataChunkId = Guid.NewGuid(),
                    BlobId = blobId,
                    StartTime = current,
                    EndTime = current.AddHours(1)
                }, token).ConfigureAwait(false);
            }
            current = current.AddHours(1);
        }
    }
}


using EventFlow;
using EventFlow.Queries;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using Stratrack.Api.Domain.DataSources;
using Stratrack.Api.Domain.DataSources.Commands;
using Stratrack.Api.Domain.DataSources.Queries;
using Stratrack.Api.Domain.Dukascopy.Commands;
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

    public async Task FetchAsync(Guid jobId, Guid dataSourceId, string symbol, DateTimeOffset startTime, CancellationToken token)
    {
        var success = false;
        try
        {
            var ds = await _queryProcessor.ProcessAsync(new ReadModelByIdQuery<DataSourceReadModel>(DataSourceId.With(dataSourceId)), token).ConfigureAwait(false);
            if (ds == null)
            {
                _logger.LogWarning("Data source {DataSourceId} not found", dataSourceId);
                return;
            }

            await ProcessSourceAsync(ds, startTime, token).ConfigureAwait(false);
            success = true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process dukascopy fetch");
        }
        finally
        {
            await _commandBus.PublishAsync(new DukascopyJobExecutedCommand(DukascopyJobId.With(jobId))
            {
                ExecutedAt = DateTimeOffset.UtcNow,
                IsSuccess = success
            }, token).ConfigureAwait(false);
        }
    }

    private async Task ProcessSourceAsync(DataSourceReadModel ds, DateTimeOffset startTime, CancellationToken token)
    {
        var chunks = await _queryProcessor.ProcessAsync(new DataChunkReadModelSearchQuery(ds.DataSourceId), token).ConfigureAwait(false);
        var lastEnd = chunks.OrderBy(c => c.EndTime).LastOrDefault()?.EndTime ?? startTime;
        var current = lastEnd;
        var maxTime = DateTimeOffset.UtcNow.AddHours(-1);
        while (current <= maxTime)
        {
            var data = await _client.GetTickDataAsync(ds.Symbol, current, token).ConfigureAwait(false);
            if (data != null && data.Length > 0)
            {
                var blobId = await _blobStorage.SaveAsync(
                    $"{ds.Symbol}_{current:yyyyMMddHH}.csv",
                    "text/csv",
                    data,
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


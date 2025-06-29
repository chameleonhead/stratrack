using EventFlow;
using EventFlow.EntityFramework;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stratrack.Api.Domain.DataSources;
using Stratrack.Api.Domain.DataSources.Commands;
using Stratrack.Api.Domain.Blobs;

namespace Stratrack.Api.Domain.Dukascopy;

public class DukascopyFetchService(
    IDukascopyClient client,
    IDbContextProvider<StratrackDbContext> dbContextProvider,
    IBlobStorage blobStorage,
    ICommandBus commandBus,
    ILogger<DukascopyFetchService> logger
)
{
    private readonly IDukascopyClient _client = client;
    private readonly IDbContextProvider<StratrackDbContext> _dbContextProvider = dbContextProvider;
    private readonly IBlobStorage _blobStorage = blobStorage;
    private readonly ICommandBus _commandBus = commandBus;
    private readonly ILogger<DukascopyFetchService> _logger = logger;

    public async Task FetchAsync(string symbol, DateTimeOffset startTime, CancellationToken token)
    {
        try
        {
            using var context = _dbContextProvider.CreateContext();
            var sources = await context.DataSources
                .Where(d => d.SourceType == "dukascopy" && d.Timeframe == "tick" && d.Symbol == symbol)
                .ToListAsync(token).ConfigureAwait(false);
            foreach (var ds in sources)
            {
                await ProcessSourceAsync(ds, startTime, token).ConfigureAwait(false);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process dukascopy fetch");
        }
    }

    private async Task ProcessSourceAsync(DataSourceReadModel ds, DateTimeOffset startTime, CancellationToken token)
    {
        DateTimeOffset lastEnd;
        using (var context = _dbContextProvider.CreateContext())
        {
            var lastChunk = await context.DataChunks
                .Where(c => c.DataSourceId == ds.DataSourceId)
                .OrderBy(c => c.EndTime)
                .LastOrDefaultAsync(token)
                .ConfigureAwait(false);
            lastEnd = lastChunk?.EndTime ?? startTime;
        }
        var current = lastEnd;
        while (current < DateTimeOffset.UtcNow)
        {
            var data = await _client.GetTickDataAsync(ds.Symbol, current, token).ConfigureAwait(false);
            var blobId = await _blobStorage.SaveAsync(
                $"{ds.Symbol}_{current:yyyyMMddHH}.csv",
                "text/csv",
                data,
                token).ConfigureAwait(false);
            await _commandBus.PublishAsync(new DataChunkRegisterCommand(DataSourceId.With(ds.DataSourceId))
            {
                BlobId = blobId,
                StartTime = current,
                EndTime = current.AddHours(1)
            }, token).ConfigureAwait(false);
            current = current.AddHours(1);
        }
    }
}


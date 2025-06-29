using EventFlow;
using EventFlow.EntityFramework;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stratrack.Api.Domain.DataSources;
using Stratrack.Api.Domain.DataSources.Commands;
using Stratrack.Api.Domain.Blobs;
using Stratrack.Api.Domain.DataSources.Services;

namespace Stratrack.Api.Domain.Dukascopy;

public class DukascopyFetchService(
    IDukascopyClient client,
    IDbContextProvider<StratrackDbContext> dbContextProvider,
    IBlobStorage blobStorage,
    IDataChunkStore chunkStore,
    ICommandBus commandBus,
    ILogger<DukascopyFetchService> logger
)
{
    private readonly IDukascopyClient _client = client;
    private readonly IDbContextProvider<StratrackDbContext> _dbContextProvider = dbContextProvider;
    private readonly IBlobStorage _blobStorage = blobStorage;
    private readonly IDataChunkStore _chunkStore = chunkStore;
    private readonly ICommandBus _commandBus = commandBus;
    private readonly ILogger<DukascopyFetchService> _logger = logger;

    public async Task FetchAsync(CancellationToken token)
    {
        try
        {
            using var context = _dbContextProvider.CreateContext();
            var sources = await context.DataSources
                .Where(d => d.SourceType == "dukascopy" && d.Timeframe == "tick")
                .ToListAsync(token).ConfigureAwait(false);
            foreach (var ds in sources)
            {
                await ProcessSourceAsync(ds, token).ConfigureAwait(false);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process dukascopy fetch");
        }
    }

    private async Task ProcessSourceAsync(DataSourceReadModel ds, CancellationToken token)
    {
        var chunks = await _chunkStore.GetChunksAsync(ds.DataSourceId, token).ConfigureAwait(false);
        var lastEnd = chunks.OrderBy(c => c.EndTime).LastOrDefault()?.EndTime ?? DateTimeOffset.UtcNow.AddHours(-1);
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


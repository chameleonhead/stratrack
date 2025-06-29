using EventFlow.Commands;
using EventFlow.EntityFramework;
using Microsoft.EntityFrameworkCore;
using Stratrack.Api.Domain.Blobs;
using System.Linq;

namespace Stratrack.Api.Domain.DataSources.Commands;

public class DataChunkDeleteCommandHandler(IDbContextProvider<StratrackDbContext> dbContextProvider, IBlobStorage blobStorage) : CommandHandler<DataSourceAggregate, DataSourceId, DataChunkDeleteCommand>
{
    private readonly IDbContextProvider<StratrackDbContext> _dbContextProvider = dbContextProvider;
    private readonly IBlobStorage _blobStorage = blobStorage;
    public override async Task ExecuteAsync(DataSourceAggregate aggregate, DataChunkDeleteCommand command, CancellationToken cancellationToken)
    {
        using var context = _dbContextProvider.CreateContext();
        var query = context.DataChunks.Where(c => c.DataSourceId == aggregate.Id.GetGuid());
        if (command.StartTime.HasValue && command.EndTime.HasValue)
        {
            query = query.Where(c => c.StartTime < command.EndTime && c.EndTime > command.StartTime);
        }
        var chunks = await query.ToListAsync(cancellationToken).ConfigureAwait(false);
        foreach (var chunk in chunks)
        {
            await _blobStorage.DeleteAsync(chunk.BlobId, cancellationToken).ConfigureAwait(false);
            aggregate.DeleteDataChunk(chunk.DataChunkId);
        }
    }
}

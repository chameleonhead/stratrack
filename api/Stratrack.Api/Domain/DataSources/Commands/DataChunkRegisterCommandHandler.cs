using EventFlow.Commands;
using EventFlow.EntityFramework;
using Microsoft.EntityFrameworkCore;

namespace Stratrack.Api.Domain.DataSources.Commands;

public class DataChunkRegisterCommandHandler(IDbContextProvider<StratrackDbContext> dbContextProvider) : CommandHandler<DataSourceAggregate, DataSourceId, DataChunkRegisterCommand>
{
    private readonly IDbContextProvider<StratrackDbContext> _dbContextProvider = dbContextProvider;
    public override async Task ExecuteAsync(DataSourceAggregate aggregate, DataChunkRegisterCommand command, CancellationToken cancellationToken)
    {
        Guid chunkId;
        using (var context = _dbContextProvider.CreateContext())
        {
            var existing = await context.DataChunks
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.DataSourceId == aggregate.Id.GetGuid() && c.StartTime < command.EndTime && c.EndTime > command.StartTime, cancellationToken)
                .ConfigureAwait(false);
            chunkId = existing?.DataChunkId ?? Guid.NewGuid();
        }

        aggregate.RegisterDataChunk(chunkId, command.BlobId, command.StartTime, command.EndTime);
    }
}

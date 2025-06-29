using EventFlow.Commands;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Stratrack.Api.Domain.DataSources.Commands;

public class DataChunkRegisterCommandHandler : CommandHandler<DataSourceAggregate, DataSourceId, DataChunkRegisterCommand>
{
    public override Task ExecuteAsync(DataSourceAggregate aggregate, DataChunkRegisterCommand command, CancellationToken cancellationToken)
    {
        var chunkId = command.DataChunkId == Guid.Empty ? Guid.NewGuid() : command.DataChunkId;
        aggregate.RegisterDataChunk(chunkId, command.BlobId, command.StartTime, command.EndTime);
        return Task.CompletedTask;
    }
}

using EventFlow.Commands;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Stratrack.Api.Domain.DataSources.Commands;

public class DataChunkDeleteCommandHandler : CommandHandler<DataSourceAggregate, DataSourceId, DataChunkDeleteCommand>
{
    public override Task ExecuteAsync(DataSourceAggregate aggregate, DataChunkDeleteCommand command, CancellationToken cancellationToken)
    {
        foreach (var id in command.DataChunkIds)
        {
            aggregate.DeleteDataChunk(id);
        }
        return Task.CompletedTask;
    }
}

using EventFlow.Commands;
using Stratrack.Api.Domain.DataSources.Services;

namespace Stratrack.Api.Domain.DataSources.Commands;

public class DataChunkDeleteCommandHandler(IDataChunkRemover remover) : CommandHandler<DataSourceAggregate, DataSourceId, DataChunkDeleteCommand>
{
    private readonly IDataChunkRemover _remover = remover;
    public override async Task ExecuteAsync(DataSourceAggregate aggregate, DataChunkDeleteCommand command, CancellationToken cancellationToken)
    {
        var ids = await _remover.DeleteAsync(
            aggregate.Id.GetGuid(),
            command.StartTime,
            command.EndTime,
            cancellationToken).ConfigureAwait(false);
        foreach (var id in ids)
        {
            aggregate.DeleteDataChunk(id);
        }
    }
}

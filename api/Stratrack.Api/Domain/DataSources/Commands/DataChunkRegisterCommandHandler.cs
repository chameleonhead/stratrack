using EventFlow.Commands;
using Stratrack.Api.Domain.DataSources.Services;

namespace Stratrack.Api.Domain.DataSources.Commands;

public class DataChunkRegisterCommandHandler(IDataChunkRegistrar registrar) : CommandHandler<DataSourceAggregate, DataSourceId, DataChunkRegisterCommand>
{
    private readonly IDataChunkRegistrar _registrar = registrar;
    public override async Task ExecuteAsync(DataSourceAggregate aggregate, DataChunkRegisterCommand command, CancellationToken cancellationToken)
    {
        var chunk = await _registrar.RegisterAsync(
            aggregate.Id.GetGuid(),
            command.BlobId,
            command.StartTime,
            command.EndTime,
            cancellationToken).ConfigureAwait(false);
        aggregate.RegisterDataChunk(chunk.Id, command.BlobId, command.StartTime, command.EndTime);
    }
}

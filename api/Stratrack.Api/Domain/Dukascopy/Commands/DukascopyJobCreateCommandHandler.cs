using EventFlow.Commands;

namespace Stratrack.Api.Domain.Dukascopy.Commands;

public class DukascopyJobCreateCommandHandler : CommandHandler<DukascopyJobAggregate, DukascopyJobId, DukascopyJobCreateCommand>
{
    public override Task ExecuteAsync(DukascopyJobAggregate aggregate, DukascopyJobCreateCommand command, CancellationToken cancellationToken)
    {
        aggregate.Create(command.DataSourceId, command.Symbol, command.StartTime);
        return Task.CompletedTask;
    }
}

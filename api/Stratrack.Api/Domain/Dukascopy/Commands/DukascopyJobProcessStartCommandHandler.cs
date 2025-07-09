using EventFlow.Commands;

namespace Stratrack.Api.Domain.Dukascopy.Commands;

public class DukascopyJobProcessStartCommandHandler : CommandHandler<DukascopyJobAggregate, DukascopyJobId, DukascopyJobProcessStartCommand>
{
    public override Task ExecuteAsync(DukascopyJobAggregate aggregate, DukascopyJobProcessStartCommand command, CancellationToken cancellationToken)
    {
        aggregate.StartProcess();
        return Task.CompletedTask;
    }
}

using EventFlow.Commands;

namespace Stratrack.Api.Domain.Dukascopy.Commands;

public class DukascopyJobDisableCommandHandler : CommandHandler<DukascopyJobAggregate, DukascopyJobId, DukascopyJobDisableCommand>
{
    public override Task ExecuteAsync(DukascopyJobAggregate aggregate, DukascopyJobDisableCommand command, CancellationToken cancellationToken)
    {
        aggregate.Disable();
        return Task.CompletedTask;
    }
}

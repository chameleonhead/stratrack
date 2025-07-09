using EventFlow.Commands;

namespace Stratrack.Api.Domain.Dukascopy.Commands;

public class DukascopyJobEnableCommandHandler : CommandHandler<DukascopyJobAggregate, DukascopyJobId, DukascopyJobEnableCommand>
{
    public override Task ExecuteAsync(DukascopyJobAggregate aggregate, DukascopyJobEnableCommand command, CancellationToken cancellationToken)
    {
        aggregate.Enable();
        return Task.CompletedTask;
    }
}

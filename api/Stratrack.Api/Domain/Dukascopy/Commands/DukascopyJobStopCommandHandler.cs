using EventFlow.Commands;

namespace Stratrack.Api.Domain.Dukascopy.Commands;

public class DukascopyJobStopCommandHandler : CommandHandler<DukascopyJobAggregate, DukascopyJobId, DukascopyJobStopCommand>
{
    public override Task ExecuteAsync(DukascopyJobAggregate aggregate, DukascopyJobStopCommand command, CancellationToken cancellationToken)
    {
        aggregate.Stop();
        return Task.CompletedTask;
    }
}

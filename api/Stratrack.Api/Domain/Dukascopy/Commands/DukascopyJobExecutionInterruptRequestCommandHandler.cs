using EventFlow.Commands;

namespace Stratrack.Api.Domain.Dukascopy.Commands;

public class DukascopyJobExecutionInterruptRequestCommandHandler : CommandHandler<DukascopyJobAggregate, DukascopyJobId, DukascopyJobExecutionInterruptRequestCommand>
{
    public override Task ExecuteAsync(DukascopyJobAggregate aggregate, DukascopyJobExecutionInterruptRequestCommand command, CancellationToken cancellationToken)
    {
        aggregate.RequestInterrupt();
        return Task.CompletedTask;
    }
}

using EventFlow.Commands;

namespace Stratrack.Api.Domain.Dukascopy.Commands;

public class DukascopyJobExecutionInterruptCommandHandler : CommandHandler<DukascopyJobAggregate, DukascopyJobId, DukascopyJobExecutionInterruptCommand>
{
    public override Task ExecuteAsync(DukascopyJobAggregate aggregate, DukascopyJobExecutionInterruptCommand command, CancellationToken cancellationToken)
    {
        aggregate.Interrupt(command.ExecutionId, command.ErrorMessage);
        return Task.CompletedTask;
    }
}

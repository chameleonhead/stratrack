using EventFlow.Commands;

namespace Stratrack.Api.Domain.Dukascopy.Commands;

public class DukascopyJobExecutionFinishCommandHandler : CommandHandler<DukascopyJobAggregate, DukascopyJobId, DukascopyJobExecutionFinishCommand>
{
    public override Task ExecuteAsync(DukascopyJobAggregate aggregate, DukascopyJobExecutionFinishCommand command, CancellationToken cancellationToken)
    {
        aggregate.FinishExecution(command.ExecutionId, command.IsSuccess, command.ErrorMessage);
        return Task.CompletedTask;
    }
}

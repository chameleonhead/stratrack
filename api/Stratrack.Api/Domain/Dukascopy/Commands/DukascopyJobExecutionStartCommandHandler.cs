using EventFlow.Commands;

namespace Stratrack.Api.Domain.Dukascopy.Commands;

public class DukascopyJobExecutionStartCommandHandler : CommandHandler<DukascopyJobAggregate, DukascopyJobId, DukascopyJobExecutionStartCommand>
{
    public override Task ExecuteAsync(DukascopyJobAggregate aggregate, DukascopyJobExecutionStartCommand command, CancellationToken cancellationToken)
    {
        aggregate.StartExecution(command.ExecutionId);
        return Task.CompletedTask;
    }
}

using EventFlow.Commands;

namespace Stratrack.Api.Domain.Dukascopy.Commands;

public class DukascopyJobExecutedCommandHandler : CommandHandler<DukascopyJobAggregate, DukascopyJobId, DukascopyJobExecutedCommand>
{
    public override Task ExecuteAsync(DukascopyJobAggregate aggregate, DukascopyJobExecutedCommand command, CancellationToken cancellationToken)
    {
        aggregate.LogExecution(
            command.ExecutionId,
            command.ExecutedAt,
            command.IsSuccess,
            command.Symbol,
            command.TargetTime,
            command.ErrorMessage,
            command.Duration);
        return Task.CompletedTask;
    }
}

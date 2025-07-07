using EventFlow.Commands;

namespace Stratrack.Api.Domain.Dukascopy.Commands;

public class DukascopyJobExecutedCommandHandler : CommandHandler<DukascopyJobAggregate, DukascopyJobId, DukascopyJobExecutedCommand>
{
    public override Task ExecuteAsync(DukascopyJobAggregate aggregate, DukascopyJobExecutedCommand command, CancellationToken cancellationToken)
    {
        aggregate.LogExecution(command.ExecutedAt, command.IsSuccess);
        return Task.CompletedTask;
    }
}

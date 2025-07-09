using EventFlow.Commands;

namespace Stratrack.Api.Domain.Dukascopy.Commands;

public class DukascopyJobSkippedCommandHandler : CommandHandler<DukascopyJobAggregate, DukascopyJobId, DukascopyJobSkippedCommand>
{
    public override Task ExecuteAsync(DukascopyJobAggregate aggregate, DukascopyJobSkippedCommand command, CancellationToken cancellationToken)
    {
        aggregate.LogSkip(command.ExecutedAt, command.Symbol, command.Reason);
        return Task.CompletedTask;
    }
}

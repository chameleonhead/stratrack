using EventFlow.Commands;

namespace Stratrack.Api.Domain.Dukascopy.Commands;

public class DukascopyJobDeleteCommandHandler : CommandHandler<DukascopyJobAggregate, DukascopyJobId, DukascopyJobDeleteCommand>
{
    public override Task ExecuteAsync(DukascopyJobAggregate aggregate, DukascopyJobDeleteCommand command, CancellationToken cancellationToken)
    {
        aggregate.Delete();
        return Task.CompletedTask;
    }
}

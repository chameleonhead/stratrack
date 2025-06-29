using EventFlow.Commands;

namespace Stratrack.Api.Domain.Dukascopy.Commands;

public class DukascopyJobStartCommandHandler : CommandHandler<DukascopyJobAggregate, DukascopyJobId, DukascopyJobStartCommand>
{
    public override Task ExecuteAsync(DukascopyJobAggregate aggregate, DukascopyJobStartCommand command, CancellationToken cancellationToken)
    {
        aggregate.Start();
        return Task.CompletedTask;
    }
}

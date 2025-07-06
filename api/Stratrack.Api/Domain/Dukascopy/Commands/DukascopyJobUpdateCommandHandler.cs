using EventFlow.Commands;

namespace Stratrack.Api.Domain.Dukascopy.Commands;

public class DukascopyJobUpdateCommandHandler : CommandHandler<DukascopyJobAggregate, DukascopyJobId, DukascopyJobUpdateCommand>
{
    public override Task ExecuteAsync(DukascopyJobAggregate aggregate, DukascopyJobUpdateCommand command, CancellationToken cancellationToken)
    {
        aggregate.Update(command.DataSourceId, command.StartTime);
        return Task.CompletedTask;
    }
}

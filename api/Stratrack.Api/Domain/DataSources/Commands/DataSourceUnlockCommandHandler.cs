using EventFlow.Commands;

namespace Stratrack.Api.Domain.DataSources.Commands;

public class DataSourceUnlockCommandHandler : CommandHandler<DataSourceAggregate, DataSourceId, DataSourceUnlockCommand>
{
    public override Task ExecuteAsync(DataSourceAggregate aggregate, DataSourceUnlockCommand command, CancellationToken cancellationToken)
    {
        aggregate.Unlock();
        return Task.CompletedTask;
    }
}

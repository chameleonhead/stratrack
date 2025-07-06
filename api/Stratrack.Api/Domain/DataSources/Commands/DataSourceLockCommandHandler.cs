using EventFlow.Commands;

namespace Stratrack.Api.Domain.DataSources.Commands;

public class DataSourceLockCommandHandler : CommandHandler<DataSourceAggregate, DataSourceId, DataSourceLockCommand>
{
    public override Task ExecuteAsync(DataSourceAggregate aggregate, DataSourceLockCommand command, CancellationToken cancellationToken)
    {
        aggregate.Lock();
        return Task.CompletedTask;
    }
}

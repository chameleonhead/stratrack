using EventFlow.Commands;

namespace Stratrack.Api.Domain.DataSources.Commands;

public class DataSourceDeleteCommandHandler : CommandHandler<DataSourceAggregate, DataSourceId, DataSourceDeleteCommand>
{
    public override Task ExecuteAsync(DataSourceAggregate aggregate, DataSourceDeleteCommand command, CancellationToken cancellationToken)
    {
        aggregate.Delete();
        return Task.CompletedTask;
    }
}

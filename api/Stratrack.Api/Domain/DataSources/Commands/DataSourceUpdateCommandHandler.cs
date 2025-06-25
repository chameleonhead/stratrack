using EventFlow.Commands;

namespace Stratrack.Api.Domain.DataSources.Commands;

public class DataSourceUpdateCommandHandler : CommandHandler<DataSourceAggregate, DataSourceId, DataSourceUpdateCommand>
{
    public override Task ExecuteAsync(DataSourceAggregate aggregate, DataSourceUpdateCommand command, CancellationToken cancellationToken)
    {
        aggregate.Update(command.Name, command.Description);
        return Task.CompletedTask;
    }
}

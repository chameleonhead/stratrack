using EventFlow.Commands;

namespace Stratrack.Api.Domain.DataSources.Commands;

public class DataSourceCreateCommandHandler : CommandHandler<DataSourceAggregate, DataSourceId, DataSourceCreateCommand>
{
    public override Task ExecuteAsync(DataSourceAggregate aggregate, DataSourceCreateCommand command, CancellationToken cancellationToken)
    {
        aggregate.Create(command.Name, command.Description);
        return Task.CompletedTask;
    }
}

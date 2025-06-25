using EventFlow.Commands;

namespace Stratrack.Api.Domain.DataSources.Commands;

public class DataSourceUpdateCommand(DataSourceId aggregateId) : Command<DataSourceAggregate, DataSourceId>(aggregateId)
{
    public string Name { get; set; } = "";
    public string? Description { get; set; }
}

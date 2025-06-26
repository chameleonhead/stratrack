using EventFlow.Commands;

namespace Stratrack.Api.Domain.DataSources.Commands;

public class DataSourceCreateCommand(DataSourceId aggregateId) : Command<DataSourceAggregate, DataSourceId>(aggregateId)
{
    public string Name { get; set; } = "";
    public string Symbol { get; set; } = "";
    public string Timeframe { get; set; } = "";
    public string SourceType { get; set; } = "";
    public string? Description { get; set; }
}

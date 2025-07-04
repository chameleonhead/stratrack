using EventFlow.Commands;
using Stratrack.Api.Domain.DataSources;

namespace Stratrack.Api.Domain.DataSources.Commands;

public class DataSourceCreateCommand(DataSourceId aggregateId) : Command<DataSourceAggregate, DataSourceId>(aggregateId)
{
    public string Name { get; set; } = "";
    public string Symbol { get; set; } = "";
    public string Timeframe { get; set; } = "";
    public DataFormat Format { get; set; } = DataFormat.Tick;
    public VolumeType Volume { get; set; } = VolumeType.None;
    public List<string> Fields { get; set; } = [];
    public string? Description { get; set; }
}

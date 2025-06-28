using EventFlow.Commands;

namespace Stratrack.Api.Domain.DataSources.Commands;

public class DataChunkDeleteCommand(DataSourceId aggregateId) : Command<DataSourceAggregate, DataSourceId>(aggregateId)
{
    public DateTimeOffset? StartTime { get; set; }
    public DateTimeOffset? EndTime { get; set; }
}

using EventFlow.Queries;

namespace Stratrack.Api.Domain.DataSources.Queries;

public class DataChunkRange
{
    public DateTimeOffset? StartTime { get; set; }
    public DateTimeOffset? EndTime { get; set; }
}

public class DataChunkRangeQuery(Guid dataSourceId) : IQuery<DataChunkRange?>
{
    public Guid DataSourceId { get; } = dataSourceId;
}

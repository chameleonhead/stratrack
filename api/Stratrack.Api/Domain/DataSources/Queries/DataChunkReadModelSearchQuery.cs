using EventFlow.Queries;

namespace Stratrack.Api.Domain.DataSources.Queries;

public class DataChunkReadModelSearchQuery(Guid dataSourceId) : IQuery<IReadOnlyCollection<DataChunkReadModel>>
{
    public Guid DataSourceId { get; } = dataSourceId;
}

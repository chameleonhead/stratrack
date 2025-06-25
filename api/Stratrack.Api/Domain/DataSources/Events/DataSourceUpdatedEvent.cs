using EventFlow.Aggregates;
using EventFlow.EventStores;

namespace Stratrack.Api.Domain.DataSources.Events
{
    [EventVersion("DataSourceUpdated", 1)]
    public class DataSourceUpdatedEvent(DataSourceId id, string name, string? description) : AggregateEvent<DataSourceAggregate, DataSourceId>
    {
        public DataSourceId Id { get; } = id;
        public string Name { get; } = name;
        public string? Description { get; } = description;
    }
}
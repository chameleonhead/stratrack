using EventFlow.Aggregates;
using EventFlow.EventStores;

namespace Stratrack.Api.Domain.DataSources.Events
{
    [EventVersion("DataSourceDeleted", 1)]
    public class DataSourceDeletedEvent(DataSourceId id) : AggregateEvent<DataSourceAggregate, DataSourceId>
    {
        public DataSourceId Id { get; } = id;
    }
}
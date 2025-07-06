using EventFlow.Aggregates;
using EventFlow.EventStores;

namespace Stratrack.Api.Domain.DataSources.Events;

[EventVersion("DataSourceLocked", 1)]
public class DataSourceLockedEvent() : AggregateEvent<DataSourceAggregate, DataSourceId>;

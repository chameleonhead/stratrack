using EventFlow.Aggregates;
using EventFlow.EventStores;

namespace Stratrack.Api.Domain.DataSources.Events;

[EventVersion("DataSourceUnlocked", 1)]
public class DataSourceUnlockedEvent() : AggregateEvent<DataSourceAggregate, DataSourceId>;

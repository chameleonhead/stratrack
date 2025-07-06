using EventFlow.Aggregates;
using EventFlow.EventStores;

namespace Stratrack.Api.Domain.Dukascopy.Events;

[EventVersion("DukascopyJobUpdated", 1)]
public class DukascopyJobUpdatedEvent(Guid dataSourceId, DateTimeOffset startTime)
    : AggregateEvent<DukascopyJobAggregate, DukascopyJobId>
{
    public Guid DataSourceId { get; } = dataSourceId;
    public DateTimeOffset StartTime { get; } = startTime;
}

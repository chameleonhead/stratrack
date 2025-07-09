using EventFlow.Aggregates;
using EventFlow.EventStores;

namespace Stratrack.Api.Domain.Dukascopy.Events;

[EventVersion("DukascopyJobProcessStarted", 1)]
public class DukascopyJobProcessStartedEvent(DateTimeOffset startedAt) : AggregateEvent<DukascopyJobAggregate, DukascopyJobId>
{
    public DateTimeOffset StartedAt { get; } = startedAt;
}

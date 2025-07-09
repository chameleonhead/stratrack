using EventFlow.Aggregates;
using EventFlow.EventStores;

namespace Stratrack.Api.Domain.Dukascopy.Events;

[EventVersion("DukascopyJobExecutionInterruptRequested", 1)]
public class DukascopyJobExecutionInterruptRequestedEvent : AggregateEvent<DukascopyJobAggregate, DukascopyJobId>
{
}

using EventFlow.Aggregates;
using EventFlow.EventStores;

namespace Stratrack.Api.Domain.Dukascopy.Events;

[EventVersion("DukascopyJobStarted", 1)]
public class DukascopyJobStartedEvent() : AggregateEvent<DukascopyJobAggregate, DukascopyJobId>;

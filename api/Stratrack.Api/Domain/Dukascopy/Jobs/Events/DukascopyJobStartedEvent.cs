using EventFlow.Aggregates;
using EventFlow.EventStores;

namespace Stratrack.Api.Domain.Dukascopy.Jobs.Events;

[EventVersion("DukascopyJobStarted", 1)]
public class DukascopyJobStartedEvent() : AggregateEvent<DukascopyJobAggregate, DukascopyJobId>;

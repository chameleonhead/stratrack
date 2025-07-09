using EventFlow.Aggregates;
using EventFlow.EventStores;

namespace Stratrack.Api.Domain.Dukascopy.Events;

[EventVersion("DukascopyJobEnabled", 1)]
public class DukascopyJobEnabledEvent() : AggregateEvent<DukascopyJobAggregate, DukascopyJobId>;

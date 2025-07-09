using EventFlow.Aggregates;
using EventFlow.EventStores;

namespace Stratrack.Api.Domain.Dukascopy.Events;

[EventVersion("DukascopyJobDisabled", 1)]
public class DukascopyJobDisabledEvent() : AggregateEvent<DukascopyJobAggregate, DukascopyJobId>;

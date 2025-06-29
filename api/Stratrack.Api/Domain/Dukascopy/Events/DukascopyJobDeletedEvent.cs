using EventFlow.Aggregates;
using EventFlow.EventStores;

namespace Stratrack.Api.Domain.Dukascopy.Events;

[EventVersion("DukascopyJobDeleted", 1)]
public class DukascopyJobDeletedEvent() : AggregateEvent<DukascopyJobAggregate, DukascopyJobId>;

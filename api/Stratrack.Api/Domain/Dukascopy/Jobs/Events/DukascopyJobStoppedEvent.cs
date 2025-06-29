using EventFlow.Aggregates;
using EventFlow.EventStores;

namespace Stratrack.Api.Domain.Dukascopy.Jobs.Events;

[EventVersion("DukascopyJobStopped", 1)]
public class DukascopyJobStoppedEvent() : AggregateEvent<DukascopyJobAggregate, DukascopyJobId>;

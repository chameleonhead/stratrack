using EventFlow.Aggregates;
using EventFlow.EventStores;

namespace Stratrack.Api.Domain.Dukascopy.Events;

[EventVersion("DukascopyJobExecutionStarted", 1)]
public class DukascopyJobExecutionStartedEvent(Guid executionId, DateTimeOffset startedAt) : AggregateEvent<DukascopyJobAggregate, DukascopyJobId>
{
    public Guid ExecutionId { get; } = executionId;
    public DateTimeOffset StartedAt { get; } = startedAt;
}

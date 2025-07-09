using EventFlow.Aggregates;
using EventFlow.EventStores;

namespace Stratrack.Api.Domain.Dukascopy.Events;

[EventVersion("DukascopyJobExecutionInterrupted", 1)]
public class DukascopyJobExecutionInterruptedEvent(Guid executionId, string? errorMessage) : AggregateEvent<DukascopyJobAggregate, DukascopyJobId>
{
    public Guid ExecutionId { get; } = executionId;
    public string? ErrorMessage { get; } = errorMessage;
}

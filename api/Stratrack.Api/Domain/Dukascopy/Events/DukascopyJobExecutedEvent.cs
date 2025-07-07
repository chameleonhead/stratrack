using EventFlow.Aggregates;
using EventFlow.EventStores;

namespace Stratrack.Api.Domain.Dukascopy.Events;

[EventVersion("DukascopyJobExecuted", 1)]
public class DukascopyJobExecutedEvent(DateTimeOffset executedAt, bool isSuccess) : AggregateEvent<DukascopyJobAggregate, DukascopyJobId>
{
    public DateTimeOffset ExecutedAt { get; } = executedAt;
    public bool IsSuccess { get; } = isSuccess;
}

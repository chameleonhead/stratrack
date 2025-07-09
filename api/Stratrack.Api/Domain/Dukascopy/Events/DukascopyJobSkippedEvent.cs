using EventFlow.Aggregates;
using EventFlow.EventStores;

namespace Stratrack.Api.Domain.Dukascopy.Events;

[EventVersion("DukascopyJobSkipped", 1)]
public class DukascopyJobSkippedEvent(
    DateTimeOffset executedAt,
    string symbol,
    string reason
) : AggregateEvent<DukascopyJobAggregate, DukascopyJobId>
{
    public DateTimeOffset ExecutedAt { get; } = executedAt;
    public string Symbol { get; } = symbol;
    public string Reason { get; } = reason;
}

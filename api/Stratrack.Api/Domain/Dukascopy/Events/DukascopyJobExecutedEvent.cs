using EventFlow.Aggregates;
using EventFlow.EventStores;

namespace Stratrack.Api.Domain.Dukascopy.Events;

[EventVersion("DukascopyJobExecuted", 2)]
public class DukascopyJobExecutedEvent(
    DateTimeOffset executedAt,
    bool isSuccess,
    string symbol,
    DateTimeOffset targetTime,
    string? errorMessage,
    double duration
) : AggregateEvent<DukascopyJobAggregate, DukascopyJobId>
{
    public DateTimeOffset ExecutedAt { get; } = executedAt;
    public bool IsSuccess { get; } = isSuccess;
    public string Symbol { get; } = symbol;
    public DateTimeOffset TargetTime { get; } = targetTime;
    public string? ErrorMessage { get; } = errorMessage;
    public double Duration { get; } = duration;
}

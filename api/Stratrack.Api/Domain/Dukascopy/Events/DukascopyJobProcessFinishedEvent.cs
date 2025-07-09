using EventFlow.Aggregates;
using EventFlow.EventStores;

namespace Stratrack.Api.Domain.Dukascopy.Events;

[EventVersion("DukascopyJobProcessFinished", 1)]
public class DukascopyJobProcessFinishedEvent(
    DateTimeOffset finishedAt,
    bool isSuccess,
    string? errorMessage
) : AggregateEvent<DukascopyJobAggregate, DukascopyJobId>
{
    public DateTimeOffset FinishedAt { get; } = finishedAt;
    public bool IsSuccess { get; } = isSuccess;
    public string? ErrorMessage { get; } = errorMessage;
}

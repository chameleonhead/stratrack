using EventFlow.Aggregates;
using EventFlow.EventStores;

namespace Stratrack.Api.Domain.Dukascopy.Events;

[EventVersion("DukascopyJobExecutionFinished", 1)]
public class DukascopyJobExecutionFinishedEvent(
    Guid executionId,
    DateTimeOffset finishedAt,
    bool isSuccess,
    string? errorMessage) : AggregateEvent<DukascopyJobAggregate, DukascopyJobId>
{
    public Guid ExecutionId { get; } = executionId;
    public DateTimeOffset FinishedAt { get; } = finishedAt;
    public bool IsSuccess { get; } = isSuccess;
    public string? ErrorMessage { get; } = errorMessage;
}

using EventFlow.Aggregates;
using EventFlow.EventStores;

namespace Stratrack.Api.Domain.Dukascopy.Events;

[EventVersion("DukascopyJobExecuted", 3)]
public class DukascopyJobExecutedEvent(
    Guid executionId,
    DateTimeOffset executedAt,
    bool isSuccess,
    string symbol,
    DateTimeOffset targetTime,
    string fileUrl,
    int httpStatus,
    string? eTag,
    DateTimeOffset? lastModified,
    string? errorMessage,
    double duration
) : AggregateEvent<DukascopyJobAggregate, DukascopyJobId>
{
    public Guid ExecutionId { get; } = executionId;
    public DateTimeOffset ExecutedAt { get; } = executedAt;
    public bool IsSuccess { get; } = isSuccess;
    public string Symbol { get; } = symbol;
    public DateTimeOffset TargetTime { get; } = targetTime;
    public string FileUrl { get; } = fileUrl;
    public int HttpStatus { get; } = httpStatus;
    public string? ETag { get; } = eTag;
    public DateTimeOffset? LastModified { get; } = lastModified;
    public string? ErrorMessage { get; } = errorMessage;
    public double Duration { get; } = duration;
}

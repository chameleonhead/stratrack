using EventFlow.Commands;

namespace Stratrack.Api.Domain.Dukascopy.Commands;

public class DukascopyJobRecordFetchResultCommand(DukascopyJobId aggregateId) : Command<DukascopyJobAggregate, DukascopyJobId>(aggregateId)
{
    public Guid ExecutionId { get; set; }
    public DateTimeOffset ExecutedAt { get; set; }
    public bool IsSuccess { get; set; }
    public string Symbol { get; set; } = string.Empty;
    public DateTimeOffset TargetTime { get; set; }
    public string FileUrl { get; set; } = string.Empty;
    public int HttpStatus { get; set; }
    public string? ETag { get; set; }
    public DateTimeOffset? LastModified { get; set; }
    public string? ErrorMessage { get; set; }
    public double Duration { get; set; }
}

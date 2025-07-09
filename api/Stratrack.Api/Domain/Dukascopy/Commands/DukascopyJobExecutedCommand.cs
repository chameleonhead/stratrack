using EventFlow.Commands;

namespace Stratrack.Api.Domain.Dukascopy.Commands;

public class DukascopyJobExecutedCommand(DukascopyJobId aggregateId) : Command<DukascopyJobAggregate, DukascopyJobId>(aggregateId)
{
    public Guid ExecutionId { get; set; }
    public DateTimeOffset ExecutedAt { get; set; }
    public bool IsSuccess { get; set; }
    public string Symbol { get; set; } = string.Empty;
    public DateTimeOffset TargetTime { get; set; }
    public string? ErrorMessage { get; set; }
    public double Duration { get; set; }
}

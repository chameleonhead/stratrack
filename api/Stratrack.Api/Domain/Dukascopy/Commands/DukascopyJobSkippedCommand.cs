using EventFlow.Commands;

namespace Stratrack.Api.Domain.Dukascopy.Commands;

public class DukascopyJobSkippedCommand(DukascopyJobId aggregateId) : Command<DukascopyJobAggregate, DukascopyJobId>(aggregateId)
{
    public DateTimeOffset ExecutedAt { get; set; }
    public string Symbol { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
}

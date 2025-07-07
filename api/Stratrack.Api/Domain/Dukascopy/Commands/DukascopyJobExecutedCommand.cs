using EventFlow.Commands;

namespace Stratrack.Api.Domain.Dukascopy.Commands;

public class DukascopyJobExecutedCommand(DukascopyJobId aggregateId) : Command<DukascopyJobAggregate, DukascopyJobId>(aggregateId)
{
    public DateTimeOffset ExecutedAt { get; set; }
}

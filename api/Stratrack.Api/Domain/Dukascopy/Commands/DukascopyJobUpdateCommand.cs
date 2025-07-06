using EventFlow.Commands;

namespace Stratrack.Api.Domain.Dukascopy.Commands;

public class DukascopyJobUpdateCommand(DukascopyJobId aggregateId) : Command<DukascopyJobAggregate, DukascopyJobId>(aggregateId)
{
    public Guid DataSourceId { get; set; }
    public DateTimeOffset StartTime { get; set; }
}

using EventFlow.Aggregates;
using EventFlow.EventStores;

namespace Stratrack.Api.Domain.Dukascopy.Events;
[EventVersion("DukascopyJobCreated", 1)]
public class DukascopyJobCreatedEvent(Guid dataSourceId, string symbol, DateTimeOffset startTime)
    : AggregateEvent<DukascopyJobAggregate, DukascopyJobId>
{
    public Guid DataSourceId { get; } = dataSourceId;
    public string Symbol { get; } = symbol;
    public DateTimeOffset StartTime { get; } = startTime;
}

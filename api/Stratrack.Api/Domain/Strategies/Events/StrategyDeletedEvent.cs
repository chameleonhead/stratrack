using EventFlow.Aggregates;
using EventFlow.EventStores;

namespace Stratrack.Api.Domain.Strategies.Events
{
    [EventVersion("StrategyDeleted", 1)]
    public class StrategyDeletedEvent(StrategyId id) : AggregateEvent<StrategyAggregate, StrategyId>
    {
        public StrategyId Id { get; } = id;
    }
}
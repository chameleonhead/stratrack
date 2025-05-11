using EventFlow.Aggregates;
using EventFlow.EventStores;

namespace Stratrack.Api.Domain.Strategies.Events
{
    [EventVersion("StrategyCreated", 1)]
    public class StrategyCreatedEvent(StrategyId id, string name, string? description, List<string> tags) : AggregateEvent<StrategyAggregate, StrategyId>
    {
        public StrategyId Id { get; } = id;
        public string Name { get; } = name;
        public string? Description { get; } = description;
        public List<string> Tags { get; } = tags;
    }
}
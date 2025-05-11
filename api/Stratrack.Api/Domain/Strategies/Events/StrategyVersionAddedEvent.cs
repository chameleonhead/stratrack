using EventFlow.Aggregates;
using EventFlow.EventStores;

namespace Stratrack.Api.Domain.Strategies.Events
{
    [EventVersion("StrategyVersionAdded", 1)]
    public class StrategyVersionAddedEvent(StrategyId id, int version, Dictionary<string, object> template, string? generatedCode) : AggregateEvent<StrategyAggregate, StrategyId>
    {
        public StrategyId Id { get; } = id;
        public int Version { get; } = version;
        public Dictionary<string, object> Template { get; } = template;
        public string? GeneratedCode { get; } = generatedCode;
    }
}
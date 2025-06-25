using EventFlow.Aggregates;
using EventFlow.EventStores;
using System.Text.Json;

namespace Stratrack.Api.Domain.Strategies.Events
{
    [EventVersion("StrategyVersionAdded", 1)]
    public class StrategyVersionAddedEvent(StrategyId id, int version, string? template, string? generatedCode) : AggregateEvent<StrategyAggregate, StrategyId>
    {
        public StrategyId Id { get; } = id;
        public int Version { get; } = version;
        public string? Template { get; } = template;
        public string? GeneratedCode { get; } = generatedCode;
    }
}
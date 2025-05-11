using EventFlow.Commands;

namespace Stratrack.Api.Domain.Strategies.Commands;

public class StrategyCreateCommand(StrategyId aggregateId) : Command<StrategyAggregate, StrategyId>(aggregateId)
{
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public List<string> Tags { get; set; } = [];
    public Dictionary<string, object> Template { get; set; } = [];
    public string? GeneratedCode { get; set; }
}

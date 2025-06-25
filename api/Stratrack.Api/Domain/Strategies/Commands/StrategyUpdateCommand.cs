using EventFlow.Commands;
using System.Text.Json;

namespace Stratrack.Api.Domain.Strategies.Commands;

public class StrategyUpdateCommand(StrategyId aggregateId) : Command<StrategyAggregate, StrategyId>(aggregateId)
{
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public List<string> Tags { get; set; } = [];
    public string? Template { get; set; }
    public string? GeneratedCode { get; set; }
}

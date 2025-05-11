using EventFlow.Aggregates;
using Stratrack.Api.Domain.Strategies.Events;

namespace Stratrack.Api.Domain.Strategies;

public class StrategyAggregate(StrategyId id) : AggregateRoot<StrategyAggregate, StrategyId>(id),
    IEmit<StrategyCreatedEvent>,
    IEmit<StrategyUpdatedEvent>
{
    public string StrategyName { get; private set; } = "";
    public string? Description { get; private set; }
    public List<string> Tags { get; private set; } = [];
    public int? LatestVersion { get; private set; }
    public Dictionary<string, object> Template { get; private set; } = [];
    public string? GeneratedCode { get; private set; }

    public void Create(string name, string? description, List<string> tags, Dictionary<string, object> template, string? generatedCode)
    {
        Emit(new StrategyCreatedEvent(Id, name, description, tags));
        Emit(new StrategyVersionAddedEvent(Id, LatestVersion ?? 1, template, generatedCode));
    }

    public void Update(string name, string? description, List<string> tags)
    {
        if (StrategyName == name && Description == description && Tags.All(tags.Contains) && Tags.Count == tags.Count)
        {
            return;
        }
        Emit(new StrategyUpdatedEvent(Id, name, description, tags));
    }

    public void Update(Dictionary<string, object> template, string? generatedCode)
    {
        if (GeneratedCode == generatedCode)
        {
            return;
        }
        Emit(new StrategyVersionAddedEvent(Id, (LatestVersion ?? 0) + 1, template, generatedCode));
    }

    public void Apply(StrategyCreatedEvent aggregateEvent)
    {
        StrategyName = aggregateEvent.Name;
        Description = aggregateEvent.Description;
        Tags = aggregateEvent.Tags;
    }

    public void Apply(StrategyUpdatedEvent aggregateEvent)
    {
        StrategyName = aggregateEvent.Name;
        Description = aggregateEvent.Description;
        Tags = aggregateEvent.Tags;
    }

    public void Apply(StrategyVersionAddedEvent aggregateEvent)
    {
        LatestVersion = aggregateEvent.Version;
        Template = aggregateEvent.Template;
        GeneratedCode = aggregateEvent.GeneratedCode;
    }
}

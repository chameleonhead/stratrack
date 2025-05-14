using EventFlow.Aggregates;
using EventFlow.ReadStores;
using Stratrack.Api.Domain.Strategies.Events;

namespace Stratrack.Api.Domain.Strategies;

public class StrategyReadModel : IReadModel,
    IAmReadModelFor<StrategyAggregate, StrategyId, StrategyCreatedEvent>,
    IAmReadModelFor<StrategyAggregate, StrategyId, StrategyUpdatedEvent>,
    IAmReadModelFor<StrategyAggregate, StrategyId, StrategyVersionAddedEvent>,
    IAmReadModelFor<StrategyAggregate, StrategyId, StrategyDeletedEvent>
{
    public string Id { get; set; } = "";
    public Guid StrategyId { get; set; } = Guid.Empty;
    public int? LatestVersion { get; set; }
    public Guid? LatestVersionId { get; set; }
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public List<string> Tags { get; set; } = [];
    public Dictionary<string, object> Template { get; set; } = [];
    public string? GeneratedCode { get; set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }

    public Task ApplyAsync(IReadModelContext context, IDomainEvent<StrategyAggregate, StrategyId, StrategyCreatedEvent> domainEvent, CancellationToken cancellationToken)
    {
        var strategyCreatedEvent = domainEvent.AggregateEvent;
        Id = context.ReadModelId;
        StrategyId = domainEvent.AggregateIdentity.GetGuid();
        Name = strategyCreatedEvent.Name;
        Description = strategyCreatedEvent.Description;
        Tags = strategyCreatedEvent.Tags;
        CreatedAt = domainEvent.Timestamp;
        UpdatedAt = domainEvent.Timestamp;
        return Task.CompletedTask;
    }

    public Task ApplyAsync(IReadModelContext context, IDomainEvent<StrategyAggregate, StrategyId, StrategyUpdatedEvent> domainEvent, CancellationToken cancellationToken)
    {
        var strategyCreatedEvent = domainEvent.AggregateEvent;
        Id = context.ReadModelId;
        StrategyId = domainEvent.AggregateIdentity.GetGuid();
        Name = strategyCreatedEvent.Name;
        Description = strategyCreatedEvent.Description;
        Tags = strategyCreatedEvent.Tags;
        UpdatedAt = domainEvent.Timestamp;
        return Task.CompletedTask;
    }

    public Task ApplyAsync(IReadModelContext context, IDomainEvent<StrategyAggregate, StrategyId, StrategyVersionAddedEvent> domainEvent, CancellationToken cancellationToken)
    {
        var strategyCreatedEvent = domainEvent.AggregateEvent;
        Id = context.ReadModelId;
        StrategyId = domainEvent.AggregateIdentity.GetGuid();
        LatestVersion = strategyCreatedEvent.Version;
        LatestVersionId = StrategyVersionId.From(domainEvent.AggregateIdentity, strategyCreatedEvent.Version).GetGuid();
        Template = strategyCreatedEvent.Template;
        GeneratedCode = strategyCreatedEvent.GeneratedCode;
        UpdatedAt = domainEvent.Timestamp;
        return Task.CompletedTask;
    }

    public Task ApplyAsync(IReadModelContext context, IDomainEvent<StrategyAggregate, StrategyId, StrategyDeletedEvent> domainEvent, CancellationToken cancellationToken)
    {
        context.MarkForDeletion();
        return Task.CompletedTask;
    }
}
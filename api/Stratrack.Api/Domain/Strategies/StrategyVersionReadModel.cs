using EventFlow.Aggregates;
using EventFlow.ReadStores;
using Stratrack.Api.Domain.Strategies.Events;

namespace Stratrack.Api.Domain.Strategies;

public class StrategyVersionReadModel : IReadModel,
    IAmReadModelFor<StrategyAggregate, StrategyId, StrategyVersionAddedEvent>
{
    public string Id { get; set; } = "";
    public Guid StrategyIdGuid { get; set; } = Guid.Empty;
    public Guid StrategyVersionIdGuid { get; set; } = Guid.Empty;
    public int Version { get; set; } = 0;
    public Dictionary<string, object> Template { get; set; } = [];
    public string? GeneratedCode { get; set; } = null;
    public DateTimeOffset CreatedAt { get; set; }

    public Task ApplyAsync(IReadModelContext context, IDomainEvent<StrategyAggregate, StrategyId, StrategyVersionAddedEvent> domainEvent, CancellationToken cancellationToken)
    {
        var strategyVersionAddedEvent = domainEvent.AggregateEvent;
        Id = context.ReadModelId;
        StrategyIdGuid = domainEvent.AggregateIdentity.GetGuid();
        StrategyVersionIdGuid = StrategyVersionId.From(domainEvent.AggregateIdentity, strategyVersionAddedEvent.Version).GetGuid();
        Version = strategyVersionAddedEvent.Version;
        Template = strategyVersionAddedEvent.Template;
        GeneratedCode = strategyVersionAddedEvent.GeneratedCode;
        CreatedAt = domainEvent.Timestamp;
        return Task.CompletedTask;
    }
}

using EventFlow.Aggregates;
using EventFlow.ReadStores;
using Stratrack.Api.Domain.Strategies.Events;

namespace Stratrack.Api.Domain.Strategies;

public class StrategyVersionReadModelLocator : IReadModelLocator
{
    public IEnumerable<string> GetReadModelIds(IDomainEvent domainEvent)
    {
        if (domainEvent is not IDomainEvent<StrategyAggregate, StrategyId, StrategyVersionAddedEvent> strategyVersionAdded)
        {
            yield break;
        }

        yield return StrategyVersionId.From(strategyVersionAdded.AggregateIdentity, strategyVersionAdded.AggregateEvent.Version).ToString();
    }
}

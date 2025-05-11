using EventFlow.Queries;
using EventFlow.ReadStores.InMemory.Queries;
using System.Linq.Expressions;

namespace Stratrack.Api.Domain.Strategies.Queries;

public class InMemoryStrategyVersionReadModelSearchQueryHandler(IQueryProcessor queryProcessor) : IQueryHandler<StrategyVersionReadModelSearchQuery, IReadOnlyCollection<StrategyVersionReadModel>>
{
    public Task<IReadOnlyCollection<StrategyVersionReadModel>> ExecuteQueryAsync(StrategyVersionReadModelSearchQuery query, CancellationToken cancellationToken)
    {
        var predicate = null as Expression<Predicate<StrategyVersionReadModel>>;
        if (query.StrategyId != null)
        {
            predicate = strategy => strategy.StrategyIdGuid == query.StrategyId;
        }
        if (predicate == null)
        {
            predicate = strategy => true;
        }

        return queryProcessor.ProcessAsync(new InMemoryQuery<StrategyVersionReadModel>(predicate.Compile()), cancellationToken);
    }
}

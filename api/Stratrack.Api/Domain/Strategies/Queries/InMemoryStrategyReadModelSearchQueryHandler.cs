using EventFlow.Queries;
using EventFlow.ReadStores.InMemory.Queries;

namespace Stratrack.Api.Domain.Strategies.Queries;

public class InMemoryStrategyReadModelSearchQueryHandler(IQueryProcessor queryProcessor) : IQueryHandler<StrategyReadModelSearchQuery, IReadOnlyCollection<StrategyReadModel>>
{
    public Task<IReadOnlyCollection<StrategyReadModel>> ExecuteQueryAsync(StrategyReadModelSearchQuery query, CancellationToken cancellationToken)
    {
        return queryProcessor.ProcessAsync(new InMemoryQuery<StrategyReadModel>(s => true), cancellationToken);
    }
}

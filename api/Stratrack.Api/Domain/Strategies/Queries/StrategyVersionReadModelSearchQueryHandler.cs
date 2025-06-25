using EventFlow.EntityFramework;
using EventFlow.Queries;
using Microsoft.EntityFrameworkCore;

namespace Stratrack.Api.Domain.Strategies.Queries;

public class StrategyVersionReadModelSearchQueryHandler(IDbContextProvider<StratrackDbContext> dbContextProvider) : IQueryHandler<StrategyVersionReadModelSearchQuery, IReadOnlyCollection<StrategyVersionReadModel>>
{
    public async Task<IReadOnlyCollection<StrategyVersionReadModel>> ExecuteQueryAsync(StrategyVersionReadModelSearchQuery query, CancellationToken cancellationToken)
    {
        using var context = dbContextProvider.CreateContext();
        var queriable = context.StrategyVersions.AsQueryable();
        if (query.StrategyId != null)
        {
            queriable = queriable.Where(strategy => strategy.StrategyIdGuid == query.StrategyId);
        }

        return await queriable.ToListAsync(cancellationToken).ConfigureAwait(false);
    }
}

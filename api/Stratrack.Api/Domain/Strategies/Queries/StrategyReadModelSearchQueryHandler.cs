using EventFlow.EntityFramework;
using EventFlow.Queries;
using Microsoft.EntityFrameworkCore;

namespace Stratrack.Api.Domain.Strategies.Queries;

public class StrategyReadModelSearchQueryHandler(IDbContextProvider<StratrackDbContext> dbContextProvider) : IQueryHandler<StrategyReadModelSearchQuery, IReadOnlyCollection<StrategyReadModel>>
{
    public async Task<IReadOnlyCollection<StrategyReadModel>> ExecuteQueryAsync(StrategyReadModelSearchQuery query, CancellationToken cancellationToken)
    {
        using var context = dbContextProvider.CreateContext();
        return await context.Strategies.ToListAsync().ConfigureAwait(false);
    }
}

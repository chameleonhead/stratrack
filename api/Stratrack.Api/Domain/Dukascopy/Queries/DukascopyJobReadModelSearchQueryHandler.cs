using EventFlow.EntityFramework;
using EventFlow.Queries;
using Microsoft.EntityFrameworkCore;

namespace Stratrack.Api.Domain.Dukascopy.Queries;

public class DukascopyJobReadModelSearchQueryHandler(IDbContextProvider<StratrackDbContext> dbContextProvider) : IQueryHandler<DukascopyJobReadModelSearchQuery, IReadOnlyCollection<DukascopyJobReadModel>>
{
    public async Task<IReadOnlyCollection<DukascopyJobReadModel>> ExecuteQueryAsync(DukascopyJobReadModelSearchQuery query, CancellationToken cancellationToken)
    {
        using var context = dbContextProvider.CreateContext();
        return await context.Set<DukascopyJobReadModel>().ToListAsync(cancellationToken).ConfigureAwait(false);
    }
}

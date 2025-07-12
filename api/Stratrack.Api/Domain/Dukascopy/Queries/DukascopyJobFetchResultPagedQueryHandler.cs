using EventFlow.EntityFramework;
using EventFlow.Queries;
using Microsoft.EntityFrameworkCore;

namespace Stratrack.Api.Domain.Dukascopy.Queries;

public class DukascopyJobFetchResultPagedQueryHandler(IDbContextProvider<StratrackDbContext> dbContextProvider) :
    IQueryHandler<DukascopyJobFetchResultPagedQuery, IReadOnlyCollection<DukascopyJobFetchResultReadModel>>
{
    public async Task<IReadOnlyCollection<DukascopyJobFetchResultReadModel>> ExecuteQueryAsync(DukascopyJobFetchResultPagedQuery query, CancellationToken cancellationToken)
    {
        using var context = dbContextProvider.CreateContext();
        return await context.DukascopyJobFetchResults
            .OrderByDescending(e => e.LastModified)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken)
            .ConfigureAwait(false);
    }
}

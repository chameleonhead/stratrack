using EventFlow.EntityFramework;
using EventFlow.Queries;
using Microsoft.EntityFrameworkCore;

namespace Stratrack.Api.Domain.Dukascopy.Queries;

public class DukascopyJobFetchResultReadModelSearchQueryHandler(IDbContextProvider<StratrackDbContext> dbContextProvider) :
    IQueryHandler<DukascopyJobFetchResultReadModelSearchQuery, IReadOnlyCollection<DukascopyJobFetchResultReadModel>>
{
    public async Task<IReadOnlyCollection<DukascopyJobFetchResultReadModel>> ExecuteQueryAsync(DukascopyJobFetchResultReadModelSearchQuery query, CancellationToken cancellationToken)
    {
        using var context = dbContextProvider.CreateContext();
        var q = context.Set<DukascopyJobFetchResultReadModel>().Where(e => e.JobId == query.JobId);
        if (query.Since.HasValue)
        {
            q = q.Where(e => e.LastModified >= query.Since.Value);
        }
        return await q.OrderByDescending(e => e.LastModified).ToListAsync(cancellationToken).ConfigureAwait(false);
    }
}

using EventFlow.EntityFramework;
using EventFlow.Queries;
using Microsoft.EntityFrameworkCore;

namespace Stratrack.Api.Domain.Dukascopy.Queries;

public class DukascopyJobStepReadModelSearchQueryHandler(IDbContextProvider<StratrackDbContext> dbContextProvider) :
    IQueryHandler<DukascopyJobStepReadModelSearchQuery, IReadOnlyCollection<DukascopyJobStepReadModel>>
{
    public async Task<IReadOnlyCollection<DukascopyJobStepReadModel>> ExecuteQueryAsync(DukascopyJobStepReadModelSearchQuery query, CancellationToken cancellationToken)
    {
        using var context = dbContextProvider.CreateContext();
        var q = context.Set<DukascopyJobStepReadModel>().Where(e => e.JobId == query.JobId);
        if (query.Since.HasValue)
        {
            q = q.Where(e => e.ExecutedAt >= query.Since.Value);
        }
        return await q.OrderByDescending(e => e.ExecutedAt).ToListAsync(cancellationToken).ConfigureAwait(false);
    }
}

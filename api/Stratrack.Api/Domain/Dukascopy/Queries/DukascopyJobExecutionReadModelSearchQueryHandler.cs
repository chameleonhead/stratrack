using EventFlow.EntityFramework;
using EventFlow.Queries;
using Microsoft.EntityFrameworkCore;

namespace Stratrack.Api.Domain.Dukascopy.Queries;

public class DukascopyJobExecutionReadModelSearchQueryHandler(IDbContextProvider<StratrackDbContext> dbContextProvider) :
    IQueryHandler<DukascopyJobExecutionReadModelSearchQuery, IReadOnlyCollection<DukascopyJobExecutionReadModel>>
{
    public async Task<IReadOnlyCollection<DukascopyJobExecutionReadModel>> ExecuteQueryAsync(DukascopyJobExecutionReadModelSearchQuery query, CancellationToken cancellationToken)
    {
        using var context = dbContextProvider.CreateContext();
        var q = context.Set<DukascopyJobExecutionReadModel>().Where(e => e.JobId == query.JobId);
        if (query.Since.HasValue)
        {
            q = q.Where(e => e.ExecutedAt >= query.Since.Value);
        }
        return await q.OrderByDescending(e => e.ExecutedAt).ToListAsync(cancellationToken).ConfigureAwait(false);
    }
}

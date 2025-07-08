using EventFlow.EntityFramework;
using EventFlow.Queries;
using Microsoft.EntityFrameworkCore;

namespace Stratrack.Api.Domain.Dukascopy.Queries;

public class DukascopyJobExecutionPagedQueryHandler(IDbContextProvider<StratrackDbContext> dbContextProvider) :
    IQueryHandler<DukascopyJobExecutionPagedQuery, IReadOnlyCollection<DukascopyJobExecutionReadModel>>
{
    public async Task<IReadOnlyCollection<DukascopyJobExecutionReadModel>> ExecuteQueryAsync(DukascopyJobExecutionPagedQuery query, CancellationToken cancellationToken)
    {
        using var context = dbContextProvider.CreateContext();
        return await context.DukascopyJobExecutions
            .OrderByDescending(e => e.ExecutedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken)
            .ConfigureAwait(false);
    }
}

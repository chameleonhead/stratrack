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
        return await context.DukascopyJobExecutions
            .Where(e => e.JobId == query.JobId)
            .OrderByDescending(e => e.StartedAt)
            .ToListAsync(cancellationToken)
            .ConfigureAwait(false);
    }
}

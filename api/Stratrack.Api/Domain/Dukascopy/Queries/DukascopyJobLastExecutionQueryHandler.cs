using EventFlow.EntityFramework;
using EventFlow.Queries;
using Microsoft.EntityFrameworkCore;

namespace Stratrack.Api.Domain.Dukascopy.Queries;

public class DukascopyJobLastExecutionQueryHandler(IDbContextProvider<StratrackDbContext> dbContextProvider) :
    IQueryHandler<DukascopyJobLastExecutionQuery, DukascopyJobExecutionReadModel?>
{
    public async Task<DukascopyJobExecutionReadModel?> ExecuteQueryAsync(DukascopyJobLastExecutionQuery query, CancellationToken cancellationToken)
    {
        using var context = dbContextProvider.CreateContext();
        return await context.DukascopyJobExecutions
            .Where(e => e.JobId == query.JobId)
            .OrderByDescending(e => e.ExecutedAt)
            .FirstOrDefaultAsync(cancellationToken)
            .ConfigureAwait(false);
    }
}

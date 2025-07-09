using EventFlow.EntityFramework;
using EventFlow.Queries;
using Microsoft.EntityFrameworkCore;

namespace Stratrack.Api.Domain.Dukascopy.Queries;

public class DukascopyJobStepPagedQueryHandler(IDbContextProvider<StratrackDbContext> dbContextProvider) :
    IQueryHandler<DukascopyJobStepPagedQuery, IReadOnlyCollection<DukascopyJobStepReadModel>>
{
    public async Task<IReadOnlyCollection<DukascopyJobStepReadModel>> ExecuteQueryAsync(DukascopyJobStepPagedQuery query, CancellationToken cancellationToken)
    {
        using var context = dbContextProvider.CreateContext();
        return await context.DukascopyJobSteps
            .OrderByDescending(e => e.ExecutedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken)
            .ConfigureAwait(false);
    }
}

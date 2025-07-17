using EventFlow.EntityFramework;
using EventFlow.Queries;
using Microsoft.EntityFrameworkCore;

namespace Stratrack.Api.Domain.Dukascopy.Queries;

public class DukascopyJobFetchResultReadModelGetExecutionSummaryQueryHandler(IDbContextProvider<StratrackDbContext> dbContextProvider) :
    IQueryHandler<DukascopyJobFetchResultReadModelGetExecutionSummaryQuery, DukascopyJobFetchResultReadModelGetExecutionSummaryQueryResult>
{
    public async Task<DukascopyJobFetchResultReadModelGetExecutionSummaryQueryResult?> ExecuteQueryAsync(DukascopyJobFetchResultReadModelGetExecutionSummaryQuery query, CancellationToken cancellationToken)
    {
        using var context = dbContextProvider.CreateContext();
        return await context.Set<DukascopyJobFetchResultReadModel>().Where(e => e.JobId == query.JobId)
            .GroupBy(r => r.JobId)
            .Select(r => new DukascopyJobFetchResultReadModelGetExecutionSummaryQueryResult
            {
                LastSuccessTime = r.Where(r => r.HttpStatus == 200 || r.HttpStatus == 404)
                    .Select(e => e.TargetTime)
                    .Max(),
                OldestFailureTime = r.Where(r => r.HttpStatus != 200 && r.HttpStatus != 404)
                    .Select(e => e.TargetTime)
                    .Min(),
                TotalFetchCount = r.Count(),
                TotalSuccessCount = r.Count(e => e.HttpStatus == 200 || e.HttpStatus == 404),
                TotalFailureCount = r.Count(e => e.HttpStatus != 200 && e.HttpStatus != 404)
            })
            .FirstOrDefaultAsync(cancellationToken)
            .ConfigureAwait(false);
    }
}

using EventFlow.Queries;

namespace Stratrack.Api.Domain.Dukascopy.Queries;

public class DukascopyJobFetchResultReadModelGetExecutionSummaryQuery(Guid jobId) : IQuery<DukascopyJobFetchResultReadModelGetExecutionSummaryQueryResult>
{
    public Guid JobId { get; } = jobId;
}

public class DukascopyJobFetchResultReadModelGetExecutionSummaryQueryResult
{
    public DateTimeOffset? LastSuccessTime { get; set; }
    public DateTimeOffset? OldestFailureTime { get; set; }
    public int TotalSuccessCount { get; set; }
    public int TotalFailureCount { get; set; }
    public int TotalFetchCount { get; set; }
}

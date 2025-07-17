using EventFlow.Queries;

namespace Stratrack.Api.Domain.Dukascopy.Queries;

public class DukascopyJobFetchResultPagedQuery(Guid? jobId, int page, int pageSize) : IQuery<IReadOnlyCollection<DukascopyJobFetchResultReadModel>>
{
    public Guid? JobId { get; } = jobId;
    public int Page { get; } = page;
    public int PageSize { get; } = pageSize;
}

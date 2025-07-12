using EventFlow.Queries;

namespace Stratrack.Api.Domain.Dukascopy.Queries;

public class DukascopyJobFetchResultPagedQuery(int page, int pageSize) : IQuery<IReadOnlyCollection<DukascopyJobFetchResultReadModel>>
{
    public int Page { get; } = page;
    public int PageSize { get; } = pageSize;
}

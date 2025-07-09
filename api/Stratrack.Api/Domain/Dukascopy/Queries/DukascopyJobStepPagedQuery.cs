using EventFlow.Queries;

namespace Stratrack.Api.Domain.Dukascopy.Queries;

public class DukascopyJobStepPagedQuery(int page, int pageSize) : IQuery<IReadOnlyCollection<DukascopyJobStepReadModel>>
{
    public int Page { get; } = page;
    public int PageSize { get; } = pageSize;
}

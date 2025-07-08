using EventFlow.Queries;

namespace Stratrack.Api.Domain.Dukascopy.Queries;

public class DukascopyJobExecutionPagedQuery(int page, int pageSize) : IQuery<IReadOnlyCollection<DukascopyJobExecutionReadModel>>
{
    public int Page { get; } = page;
    public int PageSize { get; } = pageSize;
}

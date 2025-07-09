using EventFlow.Queries;

namespace Stratrack.Api.Domain.Dukascopy.Queries;

public class DukascopyJobExecutionReadModelSearchQuery(Guid jobId) : IQuery<IReadOnlyCollection<DukascopyJobExecutionReadModel>>
{
    public Guid JobId { get; } = jobId;
}

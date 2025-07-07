using EventFlow.Queries;

namespace Stratrack.Api.Domain.Dukascopy.Queries;

public class DukascopyJobExecutionReadModelSearchQuery(Guid jobId, DateTimeOffset? since) : IQuery<IReadOnlyCollection<DukascopyJobExecutionReadModel>>
{
    public Guid JobId { get; } = jobId;
    public DateTimeOffset? Since { get; } = since;
}

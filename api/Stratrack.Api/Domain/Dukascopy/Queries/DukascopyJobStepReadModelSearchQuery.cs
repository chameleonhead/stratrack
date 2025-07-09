using EventFlow.Queries;

namespace Stratrack.Api.Domain.Dukascopy.Queries;

public class DukascopyJobStepReadModelSearchQuery(Guid jobId, DateTimeOffset? since) : IQuery<IReadOnlyCollection<DukascopyJobStepReadModel>>
{
    public Guid JobId { get; } = jobId;
    public DateTimeOffset? Since { get; } = since;
}

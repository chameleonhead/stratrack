using EventFlow.Queries;

namespace Stratrack.Api.Domain.Dukascopy.Queries;

public class DukascopyJobFetchResultReadModelSearchQuery(Guid jobId, DateTimeOffset? since, DateTimeOffset? until) : IQuery<IReadOnlyCollection<DukascopyJobFetchResultReadModel>>
{
    public Guid JobId { get; } = jobId;
    public DateTimeOffset? Since { get; } = since;
    public DateTimeOffset? Until { get; } = until;
}

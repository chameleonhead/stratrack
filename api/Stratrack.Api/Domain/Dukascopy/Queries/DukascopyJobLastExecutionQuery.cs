using EventFlow.Queries;

namespace Stratrack.Api.Domain.Dukascopy.Queries;

public class DukascopyJobLastExecutionQuery(Guid jobId) : IQuery<DukascopyJobExecutionReadModel?>
{
    public Guid JobId { get; } = jobId;
}

namespace Stratrack.Api.Domain.DataSources.Services;

public interface IDataChunkRemover
{
    Task<List<Guid>> DeleteAsync(Guid dataSourceId, DateTimeOffset? startTime, DateTimeOffset? endTime, CancellationToken token);
}

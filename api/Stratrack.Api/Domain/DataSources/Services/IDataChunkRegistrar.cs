using Stratrack.Api.Domain.DataSources;

namespace Stratrack.Api.Domain.DataSources.Services;

public interface IDataChunkRegistrar
{
    Task<DataChunk> RegisterAsync(Guid dataSourceId, Guid blobId, DateTimeOffset startTime, DateTimeOffset endTime, CancellationToken token);
}

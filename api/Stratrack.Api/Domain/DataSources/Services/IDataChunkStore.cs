namespace Stratrack.Api.Domain.DataSources.Services;

public record DataChunk(Guid Id, Guid BlobId, DateTimeOffset StartTime, DateTimeOffset EndTime);

public interface IDataChunkStore
{
    Task<DataChunk?> FindOverlapAsync(Guid dataSourceId, DateTimeOffset startTime, DateTimeOffset endTime, CancellationToken token);
    Task<DataChunk> UpsertAsync(Guid dataSourceId, Guid blobId, DateTimeOffset startTime, DateTimeOffset endTime, CancellationToken token);
    Task<List<DataChunk>> DeleteAsync(Guid dataSourceId, DateTimeOffset? startTime, DateTimeOffset? endTime, CancellationToken token);
    Task<List<DataChunk>> GetChunksAsync(Guid dataSourceId, CancellationToken token);
}

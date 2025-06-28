using System.Collections.Concurrent;
using Stratrack.Api.Domain.DataSources.Services;

namespace Stratrack.Api.Infrastructure;

public class InMemoryDataChunkStore : IDataChunkStore
{
    private readonly ConcurrentDictionary<Guid, List<DataChunk>> _chunks = new();

    public Task<DataChunk?> FindOverlapAsync(Guid dataSourceId, DateTimeOffset startTime, DateTimeOffset endTime, CancellationToken token)
    {
        var chunks = _chunks.GetValueOrDefault(dataSourceId);
        var chunk = chunks?.FirstOrDefault(c => c.StartTime < endTime && c.EndTime > startTime);
        return Task.FromResult(chunk);
    }

    public Task<DataChunk> UpsertAsync(Guid dataSourceId, Guid blobId, DateTimeOffset startTime, DateTimeOffset endTime, CancellationToken token)
    {
        var list = _chunks.GetOrAdd(dataSourceId, _ => []);
        var existing = list.FirstOrDefault(c => c.StartTime < endTime && c.EndTime > startTime);
        if (existing != null)
        {
            var updated = existing with { BlobId = blobId, StartTime = startTime, EndTime = endTime };
            list[list.IndexOf(existing)] = updated;
            return Task.FromResult(updated);
        }
        var chunk = new DataChunk(Guid.NewGuid(), blobId, startTime, endTime);
        list.Add(chunk);
        return Task.FromResult(chunk);
    }

    public Task<List<DataChunk>> DeleteAsync(Guid dataSourceId, DateTimeOffset? startTime, DateTimeOffset? endTime, CancellationToken token)
    {
        var list = _chunks.GetValueOrDefault(dataSourceId);
        if (list == null)
        {
            return Task.FromResult(new List<DataChunk>());
        }
        var result = startTime.HasValue && endTime.HasValue
            ? list.Where(c => c.StartTime < endTime && c.EndTime > startTime).ToList()
            : list.ToList();
        foreach (var c in result)
        {
            list.Remove(c);
        }
        return Task.FromResult(result);
    }

    public Task<List<DataChunk>> GetChunksAsync(Guid dataSourceId, CancellationToken token)
    {
        var list = _chunks.GetValueOrDefault(dataSourceId) ?? [];
        return Task.FromResult(list.ToList());
    }
}

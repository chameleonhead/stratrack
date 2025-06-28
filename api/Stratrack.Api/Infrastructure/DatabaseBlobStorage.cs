using Stratrack.Api.Domain.Blobs;
using System.Collections.Concurrent;

namespace Stratrack.Api.Infrastructure;

public class DatabaseBlobStorage : IBlobStorage
{
    private readonly ConcurrentDictionary<Guid, byte[]> _store = new();
    public Task<Guid> SaveAsync(string fileName, string contentType, byte[] data, CancellationToken token)
    {
        var id = Guid.NewGuid();
        _store[id] = data;
        return Task.FromResult(id);
    }

    public Task DeleteAsync(Guid blobId, CancellationToken token)
    {
        _store.TryRemove(blobId, out _);
        return Task.CompletedTask;
    }
}

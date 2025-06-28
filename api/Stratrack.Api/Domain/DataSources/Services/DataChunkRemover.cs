using Stratrack.Api.Domain.Blobs;
using Stratrack.Api.Domain.DataSources.Services;

namespace Stratrack.Api.Domain.DataSources.Services;

public class DataChunkRemover(IDataChunkStore store, IBlobStorage blobStorage) : IDataChunkRemover
{
    private readonly IDataChunkStore _store = store;
    private readonly IBlobStorage _blobStorage = blobStorage;

    public async Task<List<Guid>> DeleteAsync(Guid dataSourceId, DateTimeOffset? startTime, DateTimeOffset? endTime, CancellationToken token)
    {
        var chunks = await _store.DeleteAsync(dataSourceId, startTime, endTime, token).ConfigureAwait(false);
        foreach (var chunk in chunks)
        {
            await _blobStorage.DeleteAsync(chunk.BlobId, token).ConfigureAwait(false);
        }
        return chunks.Select(c => c.Id).ToList();
    }
}

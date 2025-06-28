using Stratrack.Api.Domain.DataSources.Services;

namespace Stratrack.Api.Domain.DataSources.Services;

public class DataChunkRegistrar(IDataChunkStore store) : IDataChunkRegistrar
{
    private readonly IDataChunkStore _store = store;

    public Task<DataChunk> RegisterAsync(Guid dataSourceId, Guid blobId, DateTimeOffset startTime, DateTimeOffset endTime, CancellationToken token)
    {
        return _store.UpsertAsync(dataSourceId, blobId, startTime, endTime, token);
    }
}

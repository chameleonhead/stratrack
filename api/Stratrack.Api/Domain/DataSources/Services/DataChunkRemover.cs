using EventFlow.EntityFramework;
using Microsoft.EntityFrameworkCore;
using Stratrack.Api.Domain;
using Stratrack.Api.Domain.Blobs;

namespace Stratrack.Api.Domain.DataSources.Services;

public class DataChunkRemover(IDbContextProvider<StratrackDbContext> provider, IBlobStorage blobStorage) : IDataChunkRemover
{
    private readonly IDbContextProvider<StratrackDbContext> _provider = provider;
    private readonly IBlobStorage _blobStorage = blobStorage;

    public async Task<List<Guid>> DeleteAsync(Guid dataSourceId, DateTimeOffset? startTime, DateTimeOffset? endTime, CancellationToken token)
    {
        using var context = _provider.CreateContext();
        var query = context.DataChunks.Where(c => c.DataSourceId == dataSourceId);
        if (startTime.HasValue && endTime.HasValue)
        {
            query = query.Where(c => c.StartTime < endTime && c.EndTime > startTime);
        }
        var chunks = await query.ToListAsync(token).ConfigureAwait(false);
        foreach (var chunk in chunks)
        {
            context.DataChunks.Remove(chunk);
            await _blobStorage.DeleteAsync(chunk.BlobId, token).ConfigureAwait(false);
        }
        await context.SaveChangesAsync(token).ConfigureAwait(false);
        return chunks.Select(c => c.Id).ToList();
    }
}

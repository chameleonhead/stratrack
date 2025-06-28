using EventFlow.EntityFramework;
using Microsoft.EntityFrameworkCore;
using Stratrack.Api.Domain.DataSources;
using Stratrack.Api.Domain;

namespace Stratrack.Api.Domain.DataSources.Services;

public class DataChunkRegistrar(IDbContextProvider<StratrackDbContext> provider) : IDataChunkRegistrar
{
    private readonly IDbContextProvider<StratrackDbContext> _provider = provider;

    public async Task<DataChunk> RegisterAsync(Guid dataSourceId, Guid blobId, DateTimeOffset startTime, DateTimeOffset endTime, CancellationToken token)
    {
        using var context = _provider.CreateContext();
        var chunk = await context.DataChunks
            .FirstOrDefaultAsync(c => c.DataSourceId == dataSourceId && c.StartTime < endTime && c.EndTime > startTime, token)
            .ConfigureAwait(false);
        if (chunk == null)
        {
            chunk = new DataChunk
            {
                Id = Guid.NewGuid(),
                DataSourceId = dataSourceId,
                BlobId = blobId,
                StartTime = startTime,
                EndTime = endTime
            };
            context.DataChunks.Add(chunk);
        }
        else
        {
            chunk.BlobId = blobId;
            chunk.StartTime = startTime;
            chunk.EndTime = endTime;
        }

        await context.SaveChangesAsync(token).ConfigureAwait(false);
        return chunk;
    }
}

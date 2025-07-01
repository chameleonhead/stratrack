using EventFlow.EntityFramework;
using Microsoft.EntityFrameworkCore;
using Stratrack.Api.Domain;
using Stratrack.Api.Domain.Blobs;

namespace Stratrack.Api.Infrastructure;

public class DatabaseBlobStorage(IDbContextProvider<StratrackDbContext> dbContextProvider) : IBlobStorage
{
    private readonly IDbContextProvider<StratrackDbContext> _provider = dbContextProvider;

    public async Task<Guid> SaveAsync(string fileName, string contentType, byte[] data, CancellationToken token)
    {
        var id = Guid.NewGuid();
        using var context = _provider.CreateContext();
        context.Blobs.Add(new BlobData
        {
            Id = id,
            FileName = fileName,
            ContentType = contentType,
            Data = data
        });
        await context.SaveChangesAsync(token).ConfigureAwait(false);
        return id;
    }

    public async Task<byte[]> GetAsync(Guid blobId, CancellationToken token)
    {
        using var context = _provider.CreateContext();
        var blob = await context.Blobs.FirstOrDefaultAsync(b => b.Id == blobId, token).ConfigureAwait(false);
        return blob?.Data ?? Array.Empty<byte>();
    }

    public async Task DeleteAsync(Guid blobId, CancellationToken token)
    {
        using var context = _provider.CreateContext();
        var blob = await context.Blobs.FirstOrDefaultAsync(b => b.Id == blobId, token).ConfigureAwait(false);
        if (blob != null)
        {
            context.Blobs.Remove(blob);
            await context.SaveChangesAsync(token).ConfigureAwait(false);
        }
    }
}

using EventFlow.EntityFramework;
using Stratrack.Api.Domain;
using Stratrack.Api.Domain.Blobs;

namespace Stratrack.Api.Infrastructure;

public class DatabaseBlobStorage(IDbContextProvider<StratrackDbContext> provider) : IBlobStorage
{
    private readonly IDbContextProvider<StratrackDbContext> _provider = provider;

    public async Task<BlobEntity> SaveAsync(string fileName, string contentType, byte[] data, CancellationToken token)
    {
        using var context = _provider.CreateContext();
        var blob = new BlobEntity
        {
            Id = Guid.NewGuid(),
            FileName = fileName,
            ContentType = contentType,
            Data = data
        };
        context.Blobs.Add(blob);
        await context.SaveChangesAsync(token).ConfigureAwait(false);
        return blob;
    }
}

namespace Stratrack.Api.Domain.Blobs;

public interface IBlobStorage
{
    Task<BlobEntity> SaveAsync(string fileName, string contentType, byte[] data, CancellationToken token);
}

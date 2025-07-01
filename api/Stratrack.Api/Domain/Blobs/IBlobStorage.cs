namespace Stratrack.Api.Domain.Blobs;

public interface IBlobStorage
{
    Task<Guid> SaveAsync(string fileName, string contentType, byte[] data, CancellationToken token);
    Task<byte[]> GetAsync(Guid blobId, CancellationToken token);
    Task DeleteAsync(Guid blobId, CancellationToken token);
}

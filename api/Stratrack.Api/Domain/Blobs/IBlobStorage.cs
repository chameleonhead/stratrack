namespace Stratrack.Api.Domain.Blobs;

public interface IBlobStorage
{
    Task<Guid> SaveAsync(string fileName, string contentType, byte[] data, CancellationToken token);
    Task DeleteAsync(Guid blobId, CancellationToken token);
}

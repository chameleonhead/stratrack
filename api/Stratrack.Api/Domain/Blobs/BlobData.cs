using System.ComponentModel.DataAnnotations;

namespace Stratrack.Api.Domain.Blobs;

public class BlobData
{
    [Key]
    public Guid Id { get; set; }
    public string FileName { get; set; } = "";
    public string ContentType { get; set; } = "";
    public byte[] Data { get; set; } = Array.Empty<byte>();
}

namespace Stratrack.Api.Models;

public class DukascopyJobLog
{
    public string FileUrl { get; set; } = string.Empty;
    public int HttpStatus { get; set; }
    public string? ETag { get; set; }
    public DateTimeOffset? LastModified { get; set; }
}

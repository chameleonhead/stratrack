namespace Stratrack.Api.Models;

public class DukascopyJobStatus
{
    public bool IsRunning { get; set; }
    public DateTimeOffset? LastExecutedAt { get; set; }
    public bool? LastSucceeded { get; set; }
    public string? LastError { get; set; }
}

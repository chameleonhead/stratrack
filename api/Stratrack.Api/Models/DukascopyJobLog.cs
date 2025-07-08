namespace Stratrack.Api.Models;

public class DukascopyJobLog
{
    public DateTimeOffset ExecutedAt { get; set; }
    public bool IsSuccess { get; set; }
    public string Symbol { get; set; } = string.Empty;
    public DateTimeOffset TargetTime { get; set; }
    public string? ErrorMessage { get; set; }
    public double Duration { get; set; }
}

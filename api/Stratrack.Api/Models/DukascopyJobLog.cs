namespace Stratrack.Api.Models;

public class DukascopyJobLog
{
    public DateTimeOffset ExecutedAt { get; set; }
    public bool IsSuccess { get; set; }
}

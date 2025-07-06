namespace Stratrack.Api.Models;

public class DukascopyJobSummary
{
    public Guid Id { get; set; }
    public Guid DataSourceId { get; set; }
    public string Symbol { get; set; } = string.Empty;
    public DateTimeOffset StartTime { get; set; }
    public bool IsRunning { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

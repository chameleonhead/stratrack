namespace Stratrack.Api.Models;

public class StrategyVersionSummary
{
    public Guid Id { get; set; }
    public int Version { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? Message { get; set; }
}

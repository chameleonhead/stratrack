namespace Stratrack.Api.Models;

public class StrategyVersionDetail
{
    public Guid Id { get; set; }
    public int Version { get; set; }
    public string? Message { get; set; }
    public Dictionary<string, object> Template { get; set; } = [];
    public string? GenereatedCode { get; set; }
    public DateTime CreatedAt { get; set; }
}
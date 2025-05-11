namespace Stratrack.Api.Models;

public class StrategyVersionDetail
{
    public Guid Id { get; set; }
    public int Version { get; set; }
    public string? Message { get; set; }
    public Dictionary<string, object> Template { get; set; } = [];
    public string? GeneratedCode { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
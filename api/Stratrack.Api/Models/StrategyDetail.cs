namespace Stratrack.Api.Models;

public class StrategyDetail
{
    public Guid Id { get; set; }
    public int LatestVersion { get; set; }
    public Guid LatestVersionId { get; set; }
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public List<string> Tags { get; set; } = [];
    public Dictionary<string, object> Template { get; set; } = [];
    public string? GenereatedCode { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
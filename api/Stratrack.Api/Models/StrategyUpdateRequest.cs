namespace Stratrack.Api.Models;

public class StrategyUpdateRequest
{
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public List<string> Tags { get; set; } = [];
    public Dictionary<string, object> Template { get; set; } = [];
    public string? GeneratedCode { get; set; }
}
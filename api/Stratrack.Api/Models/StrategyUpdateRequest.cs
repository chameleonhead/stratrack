using System.ComponentModel.DataAnnotations;

namespace Stratrack.Api.Models;

public class StrategyUpdateRequest
{
    [Required]
    [MinLength(1)]
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public List<string> Tags { get; set; } = [];
    public Dictionary<string, object> Template { get; set; } = [];
    public string? GeneratedCode { get; set; }
}
using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace Stratrack.Api.Models;

public class StrategyUpdateRequest
{
    [Required]
    [MinLength(1)]
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public List<string> Tags { get; set; } = [];
    public JsonElement Template { get; set; } = JsonSerializer.Deserialize<JsonElement>("{}");
    public string? GeneratedCode { get; set; }
}
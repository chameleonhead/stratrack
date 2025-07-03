using System.ComponentModel.DataAnnotations;

namespace Stratrack.Api.Models;

public class DataSourceCreateRequest
{
    [Required]
    [MinLength(1)]
    public string Name { get; set; } = "";
    [Required]
    public string Symbol { get; set; } = "";
    [Required]
    public string Timeframe { get; set; } = "";
    [Required]
    [MinLength(1)]
    public List<string> Fields { get; set; } = [];
    public string? Description { get; set; }
}
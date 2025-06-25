using System.ComponentModel.DataAnnotations;

namespace Stratrack.Api.Models;

public class DataSourceUpdateRequest
{
    [Required]
    [MinLength(1)]
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public List<string> Tags { get; set; } = [];
}
using System.ComponentModel.DataAnnotations;
using Stratrack.Api.Domain.DataSources;

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
    public DataFormat Format { get; set; } = DataFormat.Tick;

    public VolumeType Volume { get; set; } = VolumeType.None;
    public string? Description { get; set; }
}
using System.ComponentModel.DataAnnotations;

namespace Stratrack.Api.Models;

public class CsvChunkUploadRequest
{
    [Required]
    public DateTimeOffset StartTime { get; set; }

    [Required]
    public DateTimeOffset EndTime { get; set; }

    public string? FileName { get; set; }

    [Required]
    public string Base64Data { get; set; } = "";
}

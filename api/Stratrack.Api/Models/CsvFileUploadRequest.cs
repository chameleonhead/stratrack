using System.ComponentModel.DataAnnotations;

namespace Stratrack.Api.Models;

public class CsvFileUploadRequest
{
    [Required]
    public string FileName { get; set; } = "";

    [Required]
    public string Base64Data { get; set; } = "";
}

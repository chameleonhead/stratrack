namespace Stratrack.Api.Models;

public class StrategySummary
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int LatestVersion { get; set; }
    public Guid LatestVersionId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
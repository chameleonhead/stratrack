namespace Stratrack.Api.Models;

public class StrategyVersionSummary
{
    public Guid Id { get; set; }
    public int Version { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public Guid VersionId { get; set; }
}

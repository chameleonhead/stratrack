namespace Stratrack.Api.Models;

public class DataSourceDetail
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public string Symbol { get; set; } = "";
    public string Timeframe { get; set; } = "";
    public string SourceType { get; set; } = "";
    public string? Description { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
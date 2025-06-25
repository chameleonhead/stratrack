using System.Text.Json;

namespace Stratrack.Api.Models;

public class StrategyVersionDetail
{
    public Guid Id { get; set; }
    public int Version { get; set; }
    public string? Message { get; set; }
    public JsonElement? Template { get; set; }
    public string? GeneratedCode { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
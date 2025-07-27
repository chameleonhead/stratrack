namespace Stratrack.Api.Models;

public class HistoryTick
{
    public DateTimeOffset Time { get; set; }
    public decimal Bid { get; set; }
    public decimal Ask { get; set; }
}

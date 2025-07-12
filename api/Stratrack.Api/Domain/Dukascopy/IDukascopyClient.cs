namespace Stratrack.Api.Domain.Dukascopy;

public class DukascopyFetchResult
{
    public string Url { get; init; } = string.Empty;
    public int HttpStatus { get; init; }
    public string? ETag { get; init; }
    public DateTimeOffset? LastModified { get; init; }
    public byte[]? Data { get; init; }
}

public interface IDukascopyClient
{
    Task<DukascopyFetchResult> GetTickDataAsync(string symbol, DateTimeOffset time, CancellationToken token);
}

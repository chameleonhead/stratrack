namespace Stratrack.Api.Domain.Dukascopy;

public interface IDukascopyClient
{
    Task<byte[]> GetTickDataAsync(string symbol, DateTimeOffset time, CancellationToken token);
}

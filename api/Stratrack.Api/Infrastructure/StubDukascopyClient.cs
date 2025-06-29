using Stratrack.Api.Domain.Dukascopy;

namespace Stratrack.Api.Infrastructure;

public class StubDukascopyClient : IDukascopyClient
{
    public Task<byte[]> GetTickDataAsync(string symbol, DateTimeOffset time, CancellationToken token)
    {
        return Task.FromResult(Array.Empty<byte>());
    }
}

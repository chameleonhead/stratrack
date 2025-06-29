using System.Buffers.Binary;
using LzmaDecoder = SevenZip.Compression.LZMA.Decoder;
using System.Text;
using Stratrack.Api.Domain.Dukascopy;

namespace Stratrack.Api.Infrastructure;

public class DukascopyClient : IDukascopyClient
{
    private readonly HttpClient _http = new();

    public async Task<byte[]> GetTickDataAsync(string symbol, DateTimeOffset time, CancellationToken token)
    {
        var baseTime = new DateTimeOffset(time.Year, time.Month, time.Day, time.Hour, 0, 0, time.Offset);
        var url = $"https://datafeed.dukascopy.com/datafeed/{symbol}/{baseTime:yyyy}/{baseTime:MM}/{baseTime:dd}/{baseTime:HH}h_ticks.bi5";
        var compressed = await _http.GetByteArrayAsync(url, token).ConfigureAwait(false);

        using var inStream = new MemoryStream(compressed);
        var properties = new byte[5];
        await inStream.ReadAsync(properties, token).ConfigureAwait(false);
        var decoder = new LzmaDecoder();
        decoder.SetDecoderProperties(properties);
        var outSizeBytes = new byte[8];
        await inStream.ReadAsync(outSizeBytes, token).ConfigureAwait(false);
        var outSize = BitConverter.ToInt64(outSizeBytes, 0);
        using var decompressed = new MemoryStream();
        decoder.Code(inStream, decompressed, inStream.Length - inStream.Position, outSize, null);

        var span = decompressed.ToArray();
        var sb = new StringBuilder();
        sb.AppendLine("time,bid,ask");
        for (var i = 0; i + 20 <= span.Length; i += 20)
        {
            var offset = BinaryPrimitives.ReadUInt32BigEndian(span.AsSpan(i, 4));
            var ask = BinaryPrimitives.ReadUInt32BigEndian(span.AsSpan(i + 4, 4));
            var bid = BinaryPrimitives.ReadUInt32BigEndian(span.AsSpan(i + 8, 4));
            var tickTime = baseTime.AddMilliseconds(offset);
            sb.AppendLine($"{tickTime:O},{bid / 100000.0:F5},{ask / 100000.0:F5}");
        }
        return Encoding.UTF8.GetBytes(sb.ToString());
    }
}

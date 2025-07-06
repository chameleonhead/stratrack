using EventFlow;
using EventFlow.Queries;
using Microsoft.Extensions.Logging;
using Stratrack.Api.Domain.Blobs;
using Stratrack.Api.Domain.DataSources.Commands;
using Stratrack.Api.Domain.DataSources.Queries;
using Stratrack.Api.Domain.DataSources;
using System.Text;

namespace Stratrack.Api.Infrastructure;

public class CsvChunkService(
    IQueryProcessor queryProcessor,
    IBlobStorage blobStorage,
    ICommandBus commandBus,
    ILogger<CsvChunkService> logger)
{
    private readonly IQueryProcessor _queryProcessor = queryProcessor;
    private readonly IBlobStorage _blobStorage = blobStorage;
    private readonly ICommandBus _commandBus = commandBus;
    private readonly ILogger<CsvChunkService> _logger = logger;

    public async Task<bool> ProcessAsync(DataSourceReadModel dataSource, string base64Data, CancellationToken token)
    {
        try
        {
            var csv = Encoding.UTF8.GetString(Convert.FromBase64String(base64Data));
            var lines = csv.Split('\n', StringSplitOptions.RemoveEmptyEntries);
            if (lines.Length == 0)
            {
                return false;
            }

            var required = new[] { "time" }
                .Concat((dataSource.Fields ?? string.Empty)
                    .Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(p => p.Trim().ToLower()))
                .ToArray();

            var firstParts = lines[0].Split(',').Select(p => p.Trim()).ToArray();
            var headerParts = firstParts.Select(p => p.ToLower()).ToArray();
            var hasHeader = required.All(f => headerParts.Contains(f));

            var indices = new Dictionary<string, int>();
            if (hasHeader)
            {
                foreach (var field in required)
                {
                    var idx = Array.IndexOf(headerParts, field);
                    if (idx < 0)
                    {
                        return false;
                    }
                    indices[field] = idx;
                }
            }

            var dataLines = hasHeader ? lines.Skip(1) : lines;
            var entries = dataLines
                .Select(l => l.Split(','))
                .Select(p =>
                {
                    DateTimeOffset time;
                    int offset = 1;
                    if (hasHeader)
                    {
                        time = DateTimeOffset.Parse(p[indices["time"]]);
                    }
                    else if (!DateTimeOffset.TryParse(p[0], out time))
                    {
                        if (p.Length < 2 || !DateTimeOffset.TryParse($"{p[0]} {p[1]}", out time))
                        {
                            throw new FormatException("Invalid time format");
                        }
                        offset = 2;
                    }
                    var values = hasHeader
                        ? required.Skip(1).Select(f => p[indices[f]])
                        : required.Skip(1).Select((_, i) => p[i + offset]);
                    return new
                    {
                        Time = time,
                        Line = string.Join(',', values)
                    };
                })
                .GroupBy(e => new DateTimeOffset(e.Time.Year, e.Time.Month, e.Time.Day, e.Time.Hour, 0, 0, e.Time.Offset));

            var existing = await _queryProcessor.ProcessAsync(new DataChunkReadModelSearchQuery(dataSource.DataSourceId), token).ConfigureAwait(false);
            var header = string.Join(',', required);
            foreach (var g in entries)
            {
                var chunkLines = string.Join('\n', new[] { header }.Concat(g.Select(e => $"{e.Time:o},{e.Line}"))) + "\n";
                var blobId = await _blobStorage.SaveAsync($"{dataSource.Symbol}_{g.Key:yyyyMMddHH}.csv", "text/csv", Encoding.UTF8.GetBytes(chunkLines), token).ConfigureAwait(false);
                var start = g.Key;
                var end = g.Key.AddHours(1);
                var overlap = existing.FirstOrDefault(c => c.StartTime < end && c.EndTime > start);
                var chunkId = overlap?.DataChunkId ?? Guid.NewGuid();
                await _commandBus.PublishAsync(new DataChunkRegisterCommand(DataSourceId.With(dataSource.DataSourceId))
                {
                    DataChunkId = chunkId,
                    BlobId = blobId,
                    StartTime = start,
                    EndTime = end,
                }, token).ConfigureAwait(false);
            }

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process csv file");
            return false;
        }
    }
}

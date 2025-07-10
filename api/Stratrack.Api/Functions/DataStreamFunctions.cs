using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Enums;
using Microsoft.OpenApi.Models;
using Microsoft.Extensions.Logging;
using Stratrack.Api.Domain.Blobs;
using Stratrack.Api.Domain.DataSources;
using Stratrack.Api.Domain.DataSources.Queries;
using EventFlow.Queries;
using System.Net;
using System.Linq;
using System;
using System.Collections.Generic;
using System.Text;

namespace Stratrack.Api.Functions;

public class DataStreamFunctions(
    IQueryProcessor queryProcessor,
    IBlobStorage blobStorage,
    ILogger<DataStreamFunctions> logger)
{
    private readonly IQueryProcessor _queryProcessor = queryProcessor;
    private readonly IBlobStorage _blobStorage = blobStorage;
    private readonly ILogger<DataStreamFunctions> _logger = logger;

    [Function("GetDataStream")]
    [OpenApiOperation(operationId: "get_data_stream", tags: ["DataSources"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiParameter(name: "dataSourceId", In = ParameterLocation.Path, Required = true, Type = typeof(string))]
    [OpenApiParameter(name: "startTime", In = ParameterLocation.Query, Required = true, Type = typeof(string))]
    [OpenApiParameter(name: "endTime", In = ParameterLocation.Query, Required = true, Type = typeof(string))]
    [OpenApiParameter(name: "format", In = ParameterLocation.Query, Required = false, Type = typeof(string))]
    [OpenApiParameter(name: "timeframe", In = ParameterLocation.Query, Required = false, Type = typeof(string))]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.OK, Description = "Ok")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NotFound, Description = "Not found")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.UnprocessableEntity, Description = "Unprocessable entity")]
    public async Task<HttpResponseData> GetDataStream(
        [HttpTrigger(AuthorizationLevel.Function, "get", Route = "data-sources/{dataSourceId}/stream")] HttpRequestData req,
        string dataSourceId,
        CancellationToken token)
    {
        var query = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
        var startStr = query.Get("startTime");
        var endStr = query.Get("endTime");
        var formatStr = query.Get("format")?.ToLower();
        var timeframeStr = query.Get("timeframe");
        if (startStr == null || endStr == null)
        {
            return req.CreateResponse(HttpStatusCode.UnprocessableEntity);
        }

        DateTimeOffset start;
        DateTimeOffset end;
        try
        {
            start = DateTimeOffset.Parse(startStr);
            end = DateTimeOffset.Parse(endStr);
        }
        catch
        {
            return req.CreateResponse(HttpStatusCode.UnprocessableEntity);
        }

        var dsId = Guid.Parse(dataSourceId);
        var sources = await _queryProcessor.ProcessAsync(new DataSourceReadModelSearchQuery(), token).ConfigureAwait(false);
        var dataSource = sources.FirstOrDefault(d => d.DataSourceId == dsId);
        if (dataSource == null)
        {
            return req.CreateResponse(HttpStatusCode.NotFound);
        }

        var chunks = await _queryProcessor.ProcessAsync(new DataChunkReadModelSearchQuery(dsId), token).ConfigureAwait(false);
        var target = chunks
            .Where(c => c.StartTime < end && c.EndTime > start)
            .OrderBy(c => c.StartTime)
            .ToList();

        var format = formatStr ?? (dataSource.Format == DataFormat.Tick ? "tick" : "ohlc");
        var timeframe = timeframeStr ?? dataSource.Timeframe;

        var lines = new List<string>();
        foreach (var chunk in target)
        {
            var data = await _blobStorage.GetAsync(chunk.BlobId, token).ConfigureAwait(false);
            var text = System.Text.Encoding.UTF8.GetString(data);
            lines.AddRange(text.Split('\n', StringSplitOptions.RemoveEmptyEntries).Skip(1));
        }

        var response = req.CreateResponse(HttpStatusCode.OK);
        response.Headers.Add("Content-Type", "text/plain");

        if (format == "tick")
        {
            await response.WriteStringAsync("time,bid\n", token).ConfigureAwait(false);
            foreach (var line in lines)
            {
                var parts = line.Split(',');
                if (parts.Length < 2) continue;
                var time = DateTimeOffset.Parse(parts[0]);
                if (time < start || time >= end) continue;
                await response.WriteStringAsync($"{time:o},{parts[1]}\n", token).ConfigureAwait(false);
            }
            return response;
        }

        int tfMinutes = ParseTimeframeMinutes(timeframe);
        await response.WriteStringAsync("time,open,high,low,close\n", token).ConfigureAwait(false);
        var ohlc = BuildOhlc(lines, dataSource.Format, tfMinutes, start, end);
        foreach (var c in ohlc)
        {
            await response.WriteStringAsync($"{c.Time:o},{c.Open},{c.High},{c.Low},{c.Close}\n", token).ConfigureAwait(false);
        }
        return response;
    }

    private static int ParseTimeframeMinutes(string timeframe)
    {
        return timeframe switch
        {
            "1m" => 1,
            "5m" => 5,
            "15m" => 15,
            "30m" => 30,
            "1h" => 60,
            "2h" => 120,
            "4h" => 240,
            "1d" => 1440,
            _ => 0,
        };
    }

    private static IEnumerable<(DateTimeOffset Time, decimal Open, decimal High, decimal Low, decimal Close)> BuildOhlc(IEnumerable<string> lines, DataFormat format, int tfMinutes, DateTimeOffset start, DateTimeOffset end)
    {
        var entries = new List<(DateTimeOffset Time, decimal Open, decimal High, decimal Low, decimal Close)>();
        foreach (var line in lines)
        {
            var parts = line.Split(',');
            if (parts.Length < 2) continue;
            var time = DateTimeOffset.Parse(parts[0]);
            if (time < start || time >= end) continue;
            if (format == DataFormat.Tick)
            {
                var price = decimal.Parse(parts[1]);
                entries.Add((time, price, price, price, price));
            }
            else
            {
                if (parts.Length < 5) continue;
                var open = decimal.Parse(parts[1]);
                var high = decimal.Parse(parts[2]);
                var low = decimal.Parse(parts[3]);
                var close = decimal.Parse(parts[4]);
                entries.Add((time, open, high, low, close));
            }
        }

        if (tfMinutes <= 0)
        {
            foreach (var e in entries.OrderBy(e => e.Time))
            {
                yield return e;
            }
            yield break;
        }

        var group = entries
            .OrderBy(e => e.Time)
            .GroupBy(e => AlignTime(e.Time, tfMinutes));

        foreach (var g in group)
        {
            var first = g.First();
            var last = g.Last();
            yield return (g.Key, first.Open, g.Max(x => x.High), g.Min(x => x.Low), last.Close);
        }
    }

    private static DateTimeOffset AlignTime(DateTimeOffset time, int minutes)
    {
        if (minutes <= 0) return time;
        var ticks = time.UtcTicks - (time.UtcTicks % TimeSpan.FromMinutes(minutes).Ticks);
        return new DateTimeOffset(ticks, TimeSpan.Zero);
    }
}

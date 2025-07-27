using EventFlow.EntityFramework;
using Microsoft.Extensions.DependencyInjection;
using Stratrack.Api.Domain;
using Stratrack.Api.Functions;
using Stratrack.Api.Infrastructure;
using Stratrack.Api.Models;
using Stratrack.Api.Domain.DataSources;
using System.Net;
using System.Text;
using System.Text.Json;
using System.Linq;
using WorkerHttpFake;

namespace Stratrack.Api.Tests;

[TestClass]
public class DataHistoryFunctionsTests
{
    private static ServiceProvider CreateProvider()
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddStratrack<StratrackDbContextProvider>();
        services.AddSingleton<DataSourceFunctions>();
        services.AddSingleton<DataChunkFunctions>();
        services.AddSingleton<DataHistoryFunctions>();
        var provider = services.BuildServiceProvider();
        using var ctx = provider.GetRequiredService<IDbContextProvider<StratrackDbContext>>().CreateContext();
        ctx.Database.EnsureDeleted();
        return provider;
    }

    private static async Task<string> CreateDataSourceAsync(ServiceProvider provider)
    {
        var func = provider.GetRequiredService<DataSourceFunctions>();
        var req = new HttpRequestDataBuilder()
            .WithUrl("http://localhost/api/data-sources")
            .WithMethod(HttpMethod.Post)
            .WithBody(JsonSerializer.Serialize(new DataSourceCreateRequest
            {
                Name = "ds",
                Symbol = "EURUSD",
                Timeframe = "tick",
                Format = DataFormat.Tick,
                Volume = VolumeType.None
            }))
            .Build();
        var res = await func.PostDataSource(req, CancellationToken.None);
        var detail = await res.ReadAsJsonAsync<DataSourceDetail>();
        return detail.Id.ToString();
    }

    [TestMethod]
    public async Task GetDataHistory_ReturnsJson()
    {
        using var provider = CreateProvider();
        var dsId = await CreateDataSourceAsync(provider);
        var chunkFunc = provider.GetRequiredService<DataChunkFunctions>();
        var data = Convert.ToBase64String(Encoding.UTF8.GetBytes("time,bid,ask\n"));
        var uploadReq = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/data-sources/{dsId}/chunks")
            .WithMethod(HttpMethod.Post)
            .WithBody(JsonSerializer.Serialize(new CsvChunkUploadRequest
            {
                StartTime = new DateTimeOffset(2024,1,1,0,0,0,TimeSpan.Zero),
                EndTime = new DateTimeOffset(2024,1,1,1,0,0,TimeSpan.Zero),
                Base64Data = data
            }))
            .Build();
        await chunkFunc.PostDataChunk(uploadReq, dsId, CancellationToken.None);

        var histFunc = provider.GetRequiredService<DataHistoryFunctions>();
        var req = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/data-sources/{dsId}/history?timeframe=1m&time=2024-01-01T01:00:00Z")
            .WithMethod(HttpMethod.Get)
            .Build();
        var res = await histFunc.GetDataHistory(req, dsId, CancellationToken.None);
        Assert.AreEqual(HttpStatusCode.OK, res.StatusCode);
        Assert.IsTrue(res.Headers.TryGetValues("X-Start-Time", out var sVals));
        Assert.IsTrue(res.Headers.TryGetValues("X-End-Time", out var eVals));
        Assert.AreEqual("2023-12-31T01:00:00.0000000Z", sVals.First());
        Assert.AreEqual("2024-01-01T01:00:00.0000000Z", eVals.First());
        var body = await res.ReadAsStringAsync();
        var points = JsonSerializer.Deserialize<List<HistoryOhlc>>(body);
        Assert.IsNotNull(points);
        Assert.AreEqual(0, points.Count);
    }

    [TestMethod]
    public async Task GetDataHistory_TickTimeframe_ReturnsTicks()
    {
        using var provider = CreateProvider();
        var dsId = await CreateDataSourceAsync(provider);
        var chunkFunc = provider.GetRequiredService<DataChunkFunctions>();
        var csv = new StringBuilder();
        csv.AppendLine("time,bid,ask");
        csv.AppendLine("2024-01-01T00:00:00Z,1,2");
        csv.AppendLine("2024-01-01T00:10:00Z,1.1,2.1");
        var data = Convert.ToBase64String(Encoding.UTF8.GetBytes(csv.ToString()));
        var uploadReq = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/data-sources/{dsId}/chunks")
            .WithMethod(HttpMethod.Post)
            .WithBody(JsonSerializer.Serialize(new CsvChunkUploadRequest
            {
                StartTime = new DateTimeOffset(2024,1,1,0,0,0,TimeSpan.Zero),
                EndTime = new DateTimeOffset(2024,1,1,1,0,0,TimeSpan.Zero),
                Base64Data = data
            }))
            .Build();
        await chunkFunc.PostDataChunk(uploadReq, dsId, CancellationToken.None);

        var histFunc = provider.GetRequiredService<DataHistoryFunctions>();
        var req = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/data-sources/{dsId}/history?timeframe=tick&time=2024-01-01T00:30:00Z")
            .WithMethod(HttpMethod.Get)
            .Build();
        var res = await histFunc.GetDataHistory(req, dsId, CancellationToken.None);
        Assert.AreEqual(HttpStatusCode.OK, res.StatusCode);
        var body = await res.ReadAsStringAsync();
        var points = JsonSerializer.Deserialize<List<HistoryTick>>(body);
        Assert.IsNotNull(points);
        Assert.AreEqual(2, points!.Count);
        Assert.AreEqual(1m, points[0].Bid);
        Assert.AreEqual(2m, points[0].Ask);
    }
}

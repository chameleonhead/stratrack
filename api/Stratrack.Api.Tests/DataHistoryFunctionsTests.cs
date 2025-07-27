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
            .WithUrl($"http://localhost/api/data-sources/{dsId}/history?timeframe=1m&startTime=2024-01-01T00:00:00Z&endTime=2024-01-01T01:00:00Z")
            .WithMethod(HttpMethod.Get)
            .Build();
        var res = await histFunc.GetDataHistory(req, dsId, CancellationToken.None);
        Assert.AreEqual(HttpStatusCode.OK, res.StatusCode);
        var body = await res.ReadAsStringAsync();
        var points = JsonSerializer.Deserialize<List<HistoryOhlc>>(body);
        Assert.IsNotNull(points);
        Assert.AreEqual(0, points.Count);
    }
}

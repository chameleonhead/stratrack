using EventFlow;
using EventFlow.EntityFramework;
using Microsoft.Extensions.DependencyInjection;
using Stratrack.Api.Domain;
using Stratrack.Api.Functions;
using Stratrack.Api.Infrastructure;
using Stratrack.Api.Models;
using System.Net;
using System.Text;
using System.Text.Json;
using WorkerHttpFake;

namespace Stratrack.Api.Tests;

[TestClass]
public class TickDataFunctionsTests
{
    private static ServiceProvider CreateProvider()
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddStratrack<StratrackDbContextProvider>();
        services.AddSingleton<DataSourceFunctions>();
        services.AddSingleton<TickDataFunctions>();
        var provider = services.BuildServiceProvider();
        using var ctx = provider.GetRequiredService<IDbContextProvider<StratrackDbContext>>().CreateContext();
        ctx.Database.EnsureDeleted();
        return provider;
    }

    private static async Task<string> CreateDataSourceAsync(DataSourceFunctions function)
    {
        var req = new HttpRequestDataBuilder()
            .WithUrl("http://localhost/api/data-sources")
            .WithMethod(HttpMethod.Post)
            .WithBody(JsonSerializer.Serialize(new DataSourceCreateRequest
            {
                Name = "ds",
                Symbol = "EURUSD",
                Timeframe = "tick",
                SourceType = "dukascopy"
            }))
            .Build();
        var res = await function.PostDataSource(req, CancellationToken.None);
        var detail = await res.ReadAsJsonAsync<DataSourceDetail>();
        return detail.Id.ToString();
    }

    [TestMethod]
    public async Task PostTickChunk_ReturnsCreated()
    {
        using var provider = CreateProvider();
        var dsFunc = provider.GetRequiredService<DataSourceFunctions>();
        var tickFunc = provider.GetRequiredService<TickDataFunctions>();
        var dsId = await CreateDataSourceAsync(dsFunc);

        var data = Convert.ToBase64String(Encoding.UTF8.GetBytes("time,bid,ask\n"));
        var req = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/data-sources/{dsId}/ticks")
            .WithMethod(HttpMethod.Post)
            .WithBody(JsonSerializer.Serialize(new TickChunkUploadRequest
            {
                StartTime = new DateTimeOffset(2024,1,1,0,0,0,TimeSpan.Zero),
                EndTime = new DateTimeOffset(2024,1,1,1,0,0,TimeSpan.Zero),
                Base64Data = data
            }))
            .Build();
        var response = await tickFunc.PostTickChunk(req, dsId, CancellationToken.None);
        Assert.AreEqual(HttpStatusCode.Created, response.StatusCode);
        using var ctx = provider.GetRequiredService<IDbContextProvider<StratrackDbContext>>().CreateContext();
        Assert.AreEqual(1, ctx.DataChunks.Count());
    }

    [TestMethod]
    public async Task PostTickChunk_UpdatesExistingWhenOverlap()
    {
        using var provider = CreateProvider();
        var dsFunc = provider.GetRequiredService<DataSourceFunctions>();
        var tickFunc = provider.GetRequiredService<TickDataFunctions>();
        var dsId = await CreateDataSourceAsync(dsFunc);

        var data = Convert.ToBase64String(Encoding.UTF8.GetBytes("time,bid,ask\n"));
        var req1 = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/data-sources/{dsId}/ticks")
            .WithMethod(HttpMethod.Post)
            .WithBody(JsonSerializer.Serialize(new TickChunkUploadRequest
            {
                StartTime = new DateTimeOffset(2024,1,1,0,0,0,TimeSpan.Zero),
                EndTime = new DateTimeOffset(2024,1,1,1,0,0,TimeSpan.Zero),
                Base64Data = data
            }))
            .Build();
        var res1 = await tickFunc.PostTickChunk(req1, dsId, CancellationToken.None);
        Assert.AreEqual(HttpStatusCode.Created, res1.StatusCode);

        var req2 = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/data-sources/{dsId}/ticks")
            .WithMethod(HttpMethod.Post)
            .WithBody(JsonSerializer.Serialize(new TickChunkUploadRequest
            {
                StartTime = new DateTimeOffset(2024,1,1,0,30,0,TimeSpan.Zero),
                EndTime = new DateTimeOffset(2024,1,1,1,30,0,TimeSpan.Zero),
                Base64Data = data
            }))
            .Build();
        var res2 = await tickFunc.PostTickChunk(req2, dsId, CancellationToken.None);
        Assert.AreEqual(HttpStatusCode.Created, res2.StatusCode);

        using var ctx = provider.GetRequiredService<IDbContextProvider<StratrackDbContext>>().CreateContext();
        Assert.AreEqual(1, ctx.DataChunks.Count());
    }

    [TestMethod]
    public async Task DeleteTickChunks_ByRange_RemovesChunks()
    {
        using var provider = CreateProvider();
        var dsFunc = provider.GetRequiredService<DataSourceFunctions>();
        var tickFunc = provider.GetRequiredService<TickDataFunctions>();
        var dsId = await CreateDataSourceAsync(dsFunc);

        var data = Convert.ToBase64String(Encoding.UTF8.GetBytes("time,bid,ask\n"));
        var req1 = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/data-sources/{dsId}/ticks")
            .WithMethod(HttpMethod.Post)
            .WithBody(JsonSerializer.Serialize(new TickChunkUploadRequest
            {
                StartTime = new DateTimeOffset(2024,1,1,0,0,0,TimeSpan.Zero),
                EndTime = new DateTimeOffset(2024,1,1,1,0,0,TimeSpan.Zero),
                Base64Data = data
            }))
            .Build();
        await tickFunc.PostTickChunk(req1, dsId, CancellationToken.None);

        var req2 = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/data-sources/{dsId}/ticks")
            .WithMethod(HttpMethod.Post)
            .WithBody(JsonSerializer.Serialize(new TickChunkUploadRequest
            {
                StartTime = new DateTimeOffset(2024,1,1,1,0,0,TimeSpan.Zero),
                EndTime = new DateTimeOffset(2024,1,1,2,0,0,TimeSpan.Zero),
                Base64Data = data
            }))
            .Build();
        await tickFunc.PostTickChunk(req2, dsId, CancellationToken.None);

        var delReq = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/data-sources/{dsId}/ticks?startTime=2024-01-01T00:30:00Z&endTime=2024-01-01T00:59:00Z")
            .WithMethod(HttpMethod.Delete)
            .Build();
        var delRes = await tickFunc.DeleteTickChunks(delReq, dsId, CancellationToken.None);
        Assert.AreEqual(HttpStatusCode.NoContent, delRes.StatusCode);

        using var ctx = provider.GetRequiredService<IDbContextProvider<StratrackDbContext>>().CreateContext();
        Assert.AreEqual(1, ctx.DataChunks.Count());
    }

    [TestMethod]
    public async Task DeleteTickChunks_DeleteAll_RemovesAll()
    {
        using var provider = CreateProvider();
        var dsFunc = provider.GetRequiredService<DataSourceFunctions>();
        var tickFunc = provider.GetRequiredService<TickDataFunctions>();
        var dsId = await CreateDataSourceAsync(dsFunc);

        var data = Convert.ToBase64String(Encoding.UTF8.GetBytes("time,bid,ask\n"));
        var req1 = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/data-sources/{dsId}/ticks")
            .WithMethod(HttpMethod.Post)
            .WithBody(JsonSerializer.Serialize(new TickChunkUploadRequest
            {
                StartTime = new DateTimeOffset(2024,1,1,0,0,0,TimeSpan.Zero),
                EndTime = new DateTimeOffset(2024,1,1,1,0,0,TimeSpan.Zero),
                Base64Data = data
            }))
            .Build();
        await tickFunc.PostTickChunk(req1, dsId, CancellationToken.None);

        var delReq = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/data-sources/{dsId}/ticks")
            .WithMethod(HttpMethod.Delete)
            .Build();
        var delRes = await tickFunc.DeleteTickChunks(delReq, dsId, CancellationToken.None);
        Assert.AreEqual(HttpStatusCode.NoContent, delRes.StatusCode);

        using var ctx = provider.GetRequiredService<IDbContextProvider<StratrackDbContext>>().CreateContext();
        Assert.AreEqual(0, ctx.DataChunks.Count());
    }
}

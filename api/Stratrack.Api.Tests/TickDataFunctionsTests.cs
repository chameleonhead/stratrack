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
        Assert.AreEqual(1, ctx.Blobs.Count());
    }
}

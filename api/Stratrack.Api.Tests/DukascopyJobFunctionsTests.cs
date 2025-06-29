using Microsoft.Extensions.DependencyInjection;
using Stratrack.Api.Domain;
using Stratrack.Api.Functions;
using Stratrack.Api.Infrastructure;
using EventFlow.EntityFramework;
using System.Net;
using WorkerHttpFake;
using System.Threading;

namespace Stratrack.Api.Tests;

[TestClass]
public class DukascopyJobFunctionsTests
{
    private static ServiceProvider CreateProvider()
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddStratrack<StratrackDbContextProvider>();
        services.AddSingleton<DukascopyJobFunctions>();
        var sp = services.BuildServiceProvider();
        using var ctx = sp.GetRequiredService<IDbContextProvider<StratrackDbContext>>().CreateContext();
        ctx.Database.EnsureDeleted();
        return sp;
    }

    [TestMethod]
    public async Task CreateDeleteJob_ReturnsAccepted()
    {
        using var provider = CreateProvider();
        var func = provider.GetRequiredService<DukascopyJobFunctions>();

        var createReq = new HttpRequestDataBuilder()
            .WithUrl("http://localhost/api/dukascopy-job")
            .WithMethod(HttpMethod.Post)
            .WithBody(System.Text.Json.JsonSerializer.Serialize(new { symbol = "EURUSD", startTime = DateTimeOffset.UtcNow }))
            .Build();
        var createRes = await func.CreateJob(createReq, CancellationToken.None);
        Assert.AreEqual(HttpStatusCode.Accepted, createRes.StatusCode);
        var result = await createRes.ReadAsJsonAsync<Dictionary<string, object>>();
        var id = Guid.Parse(result["id"].ToString()!);

        var startReq = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/dukascopy-job/{id}/start")
            .WithMethod(HttpMethod.Post)
            .Build();
        var startRes = await func.StartJob(startReq, id, CancellationToken.None);
        Assert.AreEqual(HttpStatusCode.Accepted, startRes.StatusCode);

        var stopReq = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/dukascopy-job/{id}/stop")
            .WithMethod(HttpMethod.Post)
            .Build();
        var stopRes = await func.StopJob(stopReq, id, CancellationToken.None);
        Assert.AreEqual(HttpStatusCode.Accepted, stopRes.StatusCode);

        var deleteReq = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/dukascopy-job/{id}")
            .WithMethod(HttpMethod.Delete)
            .Build();
        var deleteRes = await func.DeleteJob(deleteReq, id, CancellationToken.None);
        Assert.AreEqual(HttpStatusCode.Accepted, deleteRes.StatusCode);
    }
}


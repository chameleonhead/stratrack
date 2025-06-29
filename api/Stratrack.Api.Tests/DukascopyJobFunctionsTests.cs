using Microsoft.Extensions.DependencyInjection;
using Stratrack.Api.Domain;
using Stratrack.Api.Functions;
using Stratrack.Api.Infrastructure;
using EventFlow.EntityFramework;
using System.Net;
using WorkerHttpFake;

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
    public async Task StartStopJob_ReturnsAccepted()
    {
        using var provider = CreateProvider();
        var func = provider.GetRequiredService<DukascopyJobFunctions>();

        var startReq = new HttpRequestDataBuilder()
            .WithUrl("http://localhost/api/dukascopy-job/start")
            .WithMethod(HttpMethod.Post)
            .Build();
        var startRes = await func.StartJob(startReq);
        Assert.AreEqual(HttpStatusCode.Accepted, startRes.StatusCode);

        var stopReq = new HttpRequestDataBuilder()
            .WithUrl("http://localhost/api/dukascopy-job/stop")
            .WithMethod(HttpMethod.Post)
            .Build();
        var stopRes = await func.StopJob(stopReq);
        Assert.AreEqual(HttpStatusCode.Accepted, stopRes.StatusCode);
    }
}


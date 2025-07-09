using Microsoft.Extensions.DependencyInjection;
using Stratrack.Api.Domain;
using Stratrack.Api.Functions;
using Stratrack.Api.Infrastructure;
using EventFlow.EntityFramework;
using System.Net;
using Microsoft.EntityFrameworkCore;
using WorkerHttpFake;
using System.Threading;
using Stratrack.Api.Models;
using EventFlow;
using Moq;
using Microsoft.DurableTask.Client;
using Microsoft.DurableTask;
using Stratrack.Api.Domain.Dukascopy.Commands;
using Stratrack.Api.Domain.Dukascopy;

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
        services.AddSingleton<DukascopyJobExecutionFunctions>();
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
        var dsId = Guid.Parse(result["dataSourceId"].ToString()!);

        using (var ctx = provider.GetRequiredService<IDbContextProvider<StratrackDbContext>>().CreateContext())
        {
            var ds = await ctx.DataSources.FirstOrDefaultAsync(d => d.DataSourceId == dsId);
            Assert.IsNotNull(ds);
            var job = await ctx.DukascopyJobs.FirstOrDefaultAsync(j => j.JobId == id);
            Assert.IsNotNull(job);
            Assert.AreEqual(dsId, job.DataSourceId);
        }

        var startReq = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/dukascopy-job/{id}/enable")
            .WithMethod(HttpMethod.Post)
            .Build();
        var startRes = await func.EnableJob(startReq, id, CancellationToken.None);
        Assert.AreEqual(HttpStatusCode.Accepted, startRes.StatusCode);
        using (var ctx = provider.GetRequiredService<IDbContextProvider<StratrackDbContext>>().CreateContext())
        {
            var ds = await ctx.DataSources.FirstAsync(d => d.DataSourceId == dsId);
            Assert.IsTrue(ds.IsLocked);
        }

        var client = new Mock<DurableTaskClient>("test");
        client.Setup(c => c.ScheduleNewOrchestrationInstanceAsync(
            It.IsAny<TaskName>(),
            It.IsAny<object?>(),
            It.IsAny<StartOrchestrationOptions?>(),
            It.IsAny<CancellationToken>())).ReturnsAsync("instance");

        var stopReq = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/dukascopy-job/{id}/disable")
            .WithMethod(HttpMethod.Post)
            .Build();
        var stopRes = await func.DisableJob(stopReq, id, client.Object, CancellationToken.None);
        Assert.AreEqual(HttpStatusCode.Accepted, stopRes.StatusCode);
        using (var ctx = provider.GetRequiredService<IDbContextProvider<StratrackDbContext>>().CreateContext())
        {
            var ds = await ctx.DataSources.FirstAsync(d => d.DataSourceId == dsId);
            Assert.IsFalse(ds.IsLocked);
        }

        var execFunc = provider.GetRequiredService<DukascopyJobExecutionFunctions>();
        var execReq = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/dukascopy-job/{id}/execute")
            .WithMethod(HttpMethod.Post)
            .Build();
        var execRes = await execFunc.StartExecution(execReq, id, client.Object, CancellationToken.None);
        Assert.AreEqual(HttpStatusCode.Accepted, execRes.StatusCode);

        var deleteReq = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/dukascopy-job/{id}")
            .WithMethod(HttpMethod.Delete)
            .Build();
        var deleteRes = await func.DeleteJob(deleteReq, id, CancellationToken.None);
        Assert.AreEqual(HttpStatusCode.Accepted, deleteRes.StatusCode);
    }

    [TestMethod]
    public async Task GetJobs_ReturnsJobs()
    {
        using var provider = CreateProvider();
        var func = provider.GetRequiredService<DukascopyJobFunctions>();

        var createReq = new HttpRequestDataBuilder()
            .WithUrl("http://localhost/api/dukascopy-job")
            .WithMethod(HttpMethod.Post)
            .WithBody(System.Text.Json.JsonSerializer.Serialize(new { symbol = "EURUSD", startTime = DateTimeOffset.UtcNow }))
            .Build();
        var createRes = await func.CreateJob(createReq, CancellationToken.None);
        var created = await createRes.ReadAsJsonAsync<Dictionary<string, object>>();
        var id = Guid.Parse(created["id"].ToString()!);

        var listReq = new HttpRequestDataBuilder()
            .WithUrl("http://localhost/api/dukascopy-job")
            .WithMethod(HttpMethod.Get)
            .Build();
        var listRes = await func.GetJobs(listReq, CancellationToken.None);
        Assert.AreEqual(HttpStatusCode.OK, listRes.StatusCode);
        var jobs = await listRes.ReadAsJsonAsync<List<DukascopyJobSummary>>();
        Assert.AreEqual(1, jobs.Count);
        Assert.AreEqual(id, jobs[0].Id);
    }

}


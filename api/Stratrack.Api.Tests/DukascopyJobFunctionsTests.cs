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
            .WithUrl($"http://localhost/api/dukascopy-job/{id}/start")
            .WithMethod(HttpMethod.Post)
            .Build();
        var client = new Mock<DurableTaskClient>("test");
        client.Setup(c => c.ScheduleNewOrchestrationInstanceAsync(
            It.IsAny<TaskName>(),
            It.IsAny<object?>(),
            It.IsAny<StartOrchestrationOptions?>(),
            It.IsAny<CancellationToken>())).ReturnsAsync("instance");
        var startRes = await func.StartJob(startReq, id, client.Object, CancellationToken.None);
        Assert.AreEqual(HttpStatusCode.Accepted, startRes.StatusCode);
        using (var ctx = provider.GetRequiredService<IDbContextProvider<StratrackDbContext>>().CreateContext())
        {
            var ds = await ctx.DataSources.FirstAsync(d => d.DataSourceId == dsId);
            Assert.IsTrue(ds.IsLocked);
        }

        var stopReq = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/dukascopy-job/{id}/stop")
            .WithMethod(HttpMethod.Post)
            .Build();
        var stopRes = await func.StopJob(stopReq, id, CancellationToken.None);
        Assert.AreEqual(HttpStatusCode.Accepted, stopRes.StatusCode);
        using (var ctx = provider.GetRequiredService<IDbContextProvider<StratrackDbContext>>().CreateContext())
        {
            var ds = await ctx.DataSources.FirstAsync(d => d.DataSourceId == dsId);
            Assert.IsFalse(ds.IsLocked);
        }

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

    [TestMethod]
    public async Task GetJobStatus_ReturnsStatus()
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

        var statusReq1 = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/dukascopy-job/{id}/status")
            .WithMethod(HttpMethod.Get)
            .Build();
        var statusRes1 = await func.GetJobStatus(statusReq1, id, CancellationToken.None);
        Assert.AreEqual(HttpStatusCode.OK, statusRes1.StatusCode);
        var status1 = await statusRes1.ReadAsJsonAsync<DukascopyJobStatus>();
        Assert.IsFalse(status1.IsRunning);
        Assert.IsNull(status1.LastExecutedAt);

        var bus = provider.GetRequiredService<ICommandBus>();
        await bus.PublishAsync(new DukascopyJobExecutedCommand(DukascopyJobId.With(id))
        {
            ExecutedAt = DateTimeOffset.UtcNow,
            IsSuccess = true,
            Symbol = "EURUSD",
            TargetTime = DateTimeOffset.UtcNow,
            Duration = 1
        }, CancellationToken.None);

        var statusReq2 = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/dukascopy-job/{id}/status")
            .WithMethod(HttpMethod.Get)
            .Build();
        var statusRes2 = await func.GetJobStatus(statusReq2, id, CancellationToken.None);
        var status2 = await statusRes2.ReadAsJsonAsync<DukascopyJobStatus>();
        Assert.IsNotNull(status2.LastExecutedAt);
        Assert.IsTrue(status2.LastSucceeded.HasValue && status2.LastSucceeded.Value);
    }
}


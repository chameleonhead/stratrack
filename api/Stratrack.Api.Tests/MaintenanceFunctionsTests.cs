using EventFlow.EntityFramework;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Stratrack.Api.Domain;
using Stratrack.Api.Functions;
using Stratrack.Api.Infrastructure;
using Stratrack.Api.Models;
using Stratrack.Api.Domain.DataSources;
using System.Net;
using System.Text.Json;
using WorkerHttpFake;

namespace Stratrack.Api.Tests;

[TestClass]
public class MaintenanceFunctionsTests
{
    private static ServiceProvider CreateProvider()
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddStratrack<StratrackDbContextProvider>();
        services.AddSingleton<StratrackDbContextProvider>();
        services.AddSingleton<DataSourceFunctions>();
        services.AddSingleton<MaintenanceFunctions>();
        var provider = services.BuildServiceProvider();
        using var ctx = provider.GetRequiredService<IDbContextProvider<StratrackDbContext>>().CreateContext();
        ctx.Database.EnsureDeleted();
        return provider;
    }

    [TestMethod]
    public async Task ResetDatabase_RemovesAllData()
    {
        using var provider = CreateProvider();
        var dsFunc = provider.GetRequiredService<DataSourceFunctions>();
        var maintenanceFunc = provider.GetRequiredService<MaintenanceFunctions>();

        var createReq = new HttpRequestDataBuilder()
            .WithUrl("http://localhost/api/data-sources")
            .WithMethod(HttpMethod.Post)
            .WithBody(JsonSerializer.Serialize(new DataSourceCreateRequest
            {
                Name = "ds",
                Symbol = "EURUSD",
                Timeframe = "tick",
                Format = DataFormat.Tick
            }))
            .Build();
        var createRes = await dsFunc.PostDataSource(createReq, CancellationToken.None);
        Assert.AreEqual(HttpStatusCode.Created, createRes.StatusCode);

        using (var ctx = provider.GetRequiredService<IDbContextProvider<StratrackDbContext>>().CreateContext())
        {
            Assert.AreEqual(1, await ctx.DataSources.CountAsync());
        }

        var resetReq = new HttpRequestDataBuilder()
            .WithUrl("http://localhost/api/maintenance/reset")
            .WithMethod(HttpMethod.Post)
            .Build();
        var resetRes = await maintenanceFunc.ResetDatabase(resetReq, CancellationToken.None);
        Assert.AreEqual(HttpStatusCode.NoContent, resetRes.StatusCode);

        using (var ctx = provider.GetRequiredService<IDbContextProvider<StratrackDbContext>>().CreateContext())
        {
            Assert.AreEqual(0, await ctx.DataSources.CountAsync());
        }
    }
}

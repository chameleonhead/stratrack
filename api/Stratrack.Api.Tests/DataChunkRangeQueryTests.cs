using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using EventFlow;
using EventFlow.Queries;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Stratrack.Api.Domain;
using Stratrack.Api.Domain.DataSources;
using Stratrack.Api.Domain.DataSources.Commands;
using Stratrack.Api.Domain.DataSources.Queries;
using Stratrack.Api.Infrastructure;

namespace Stratrack.Api.Tests;

[TestClass]
public class DataChunkRangeQueryTests
{
    private static ServiceProvider CreateProvider()
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddStratrack<StratrackDbContextProvider>();
        return services.BuildServiceProvider();
    }

    [TestMethod]
    public async Task RangeQuery_ReturnsNull_WhenNoChunks()
    {
        using var provider = CreateProvider();
        var commandBus = provider.GetRequiredService<ICommandBus>();
        var queryProcessor = provider.GetRequiredService<IQueryProcessor>();
        var id = DataSourceId.New;
        await commandBus.PublishAsync(new DataSourceCreateCommand(id)
        {
            Name = "ds",
            Symbol = "EURUSD",
            Timeframe = "tick",
            Format = DataFormat.Tick,
            Volume = VolumeType.None,
            Fields = new List<string> { "bid", "ask" },
        }, CancellationToken.None);

        var range = await queryProcessor.ProcessAsync(new DataChunkRangeQuery(id.GetGuid()), CancellationToken.None);
        Assert.IsNull(range);
    }

    [TestMethod]
    public async Task RangeQuery_ReturnsCorrectRange()
    {
        using var provider = CreateProvider();
        var commandBus = provider.GetRequiredService<ICommandBus>();
        var queryProcessor = provider.GetRequiredService<IQueryProcessor>();
        var id = DataSourceId.New;
        await commandBus.PublishAsync(new DataSourceCreateCommand(id)
        {
            Name = "ds",
            Symbol = "EURUSD",
            Timeframe = "tick",
            Format = DataFormat.Tick,
            Volume = VolumeType.None,
            Fields = new List<string> { "bid", "ask" },
        }, CancellationToken.None);

        var start1 = new DateTimeOffset(2024, 1, 1, 0, 0, 0, TimeSpan.Zero);
        var end1 = start1.AddHours(1);
        await commandBus.PublishAsync(new DataChunkRegisterCommand(id)
        {
            DataChunkId = Guid.NewGuid(),
            BlobId = Guid.NewGuid(),
            StartTime = start1,
            EndTime = end1,
        }, CancellationToken.None);

        var start2 = new DateTimeOffset(2024, 1, 1, 1, 0, 0, TimeSpan.Zero);
        var end2 = start2.AddHours(1);
        await commandBus.PublishAsync(new DataChunkRegisterCommand(id)
        {
            DataChunkId = Guid.NewGuid(),
            BlobId = Guid.NewGuid(),
            StartTime = start2,
            EndTime = end2,
        }, CancellationToken.None);

        var range = await queryProcessor.ProcessAsync(new DataChunkRangeQuery(id.GetGuid()), CancellationToken.None);
        Assert.IsNotNull(range);
        Assert.AreEqual(start1, range!.StartTime);
        Assert.AreEqual(end2, range.EndTime);
    }
}

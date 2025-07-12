using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using Stratrack.Api.Domain.Dukascopy;
using Stratrack.Api.Domain.Dukascopy.Commands;
using Stratrack.Api.Domain.DataSources;
using Stratrack.Api.Domain.DataSources.Queries;
using Stratrack.Api.Domain.Blobs;
using EventFlow;
using EventFlow.Aggregates;
using EventFlow.Aggregates.ExecutionResults;
using EventFlow.Commands;
using EventFlow.Core;
using EventFlow.Queries;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Stratrack.Api.Tests;

[TestClass]
public class DukascopyFetchServiceTests
{
    private class CollectingCommandBus : ICommandBus
    {
        public List<object> Commands { get; } = new();
        public Task<TExecutionResult> PublishAsync<TAggregate, TIdentity, TExecutionResult>(
            ICommand<TAggregate, TIdentity, TExecutionResult> command,
            CancellationToken cancellationToken)
            where TAggregate : IAggregateRoot<TIdentity>
            where TIdentity : IIdentity
            where TExecutionResult : IExecutionResult
        {
            Commands.Add(command);
            return Task.FromResult(default(TExecutionResult)!);
        }
    }

    [TestMethod]
    public async Task FetchHourAsync_RecordsSuccess_For404()
    {
        var jobId = Guid.NewGuid();
        var dsId = Guid.NewGuid();
        var execId = Guid.NewGuid();
        var symbol = "EURUSD";
        var time = new DateTimeOffset(2024, 1, 1, 0, 0, 0, TimeSpan.Zero);

        var ds = new DataSourceReadModel { DataSourceId = dsId, Symbol = symbol };
        var qp = new Mock<IQueryProcessor>();
        qp.Setup(q => q.ProcessAsync(It.IsAny<ReadModelByIdQuery<DataSourceReadModel>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(ds);

        var client = new Mock<IDukascopyClient>();
        client.Setup(c => c.GetTickDataAsync(symbol, time, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new DukascopyFetchResult
            {
                Url = "url",
                HttpStatus = 404
            });

        var storage = new Mock<IBlobStorage>();
        storage.Setup(s => s.SaveAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<byte[]>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Guid.NewGuid());

        var cb = new CollectingCommandBus();
        var logger = new Mock<ILogger<DukascopyFetchService>>().Object;
        var svc = new DukascopyFetchService(client.Object, qp.Object, storage.Object, cb, logger);

        await svc.FetchHourAsync(jobId, dsId, symbol, time, execId, CancellationToken.None);

        var resultCmd = cb.Commands.OfType<DukascopyJobRecordFetchResultCommand>().Single();
        Assert.IsTrue(resultCmd.IsSuccess);
        Assert.AreEqual(404, resultCmd.HttpStatus);
    }

    [TestMethod]
    public async Task FetchHourAsync_RecordsFailure_For500()
    {
        var jobId = Guid.NewGuid();
        var dsId = Guid.NewGuid();
        var execId = Guid.NewGuid();
        var symbol = "EURUSD";
        var time = new DateTimeOffset(2024, 1, 1, 0, 0, 0, TimeSpan.Zero);

        var ds = new DataSourceReadModel { DataSourceId = dsId, Symbol = symbol };
        var qp = new Mock<IQueryProcessor>();
        qp.Setup(q => q.ProcessAsync(It.IsAny<ReadModelByIdQuery<DataSourceReadModel>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(ds);

        var client = new Mock<IDukascopyClient>();
        client.Setup(c => c.GetTickDataAsync(symbol, time, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new DukascopyFetchResult
            {
                Url = "url",
                HttpStatus = 500
            });

        var storage = new Mock<IBlobStorage>();
        storage.Setup(s => s.SaveAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<byte[]>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Guid.NewGuid());

        var cb = new CollectingCommandBus();
        var logger = new Mock<ILogger<DukascopyFetchService>>().Object;
        var svc = new DukascopyFetchService(client.Object, qp.Object, storage.Object, cb, logger);

        await svc.FetchHourAsync(jobId, dsId, symbol, time, execId, CancellationToken.None);

        var resultCmd = cb.Commands.OfType<DukascopyJobRecordFetchResultCommand>().Single();
        Assert.IsFalse(resultCmd.IsSuccess);
        Assert.AreEqual(500, resultCmd.HttpStatus);
    }
}

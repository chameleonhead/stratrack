using Microsoft.VisualStudio.TestTools.UnitTesting;
using Stratrack.Api.Infrastructure;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Stratrack.Api.Tests;

[TestClass]
public class DukascopyClientTests
{
    [TestMethod]
    public async Task GetTickDataAsync_ReturnsNullForNotFound()
    {
        var client = new DukascopyClient();
        var data = await client.GetTickDataAsync("EURUSD", new DateTimeOffset(2000,1,1,0,0,0,TimeSpan.Zero), CancellationToken.None);
        Assert.IsNull(data);
    }
}

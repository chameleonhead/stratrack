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
        var result = await client.GetTickDataAsync("EURUSD", new DateTimeOffset(2000,1,1,0,0,0,TimeSpan.Zero), CancellationToken.None);
        Assert.AreEqual(404, result.HttpStatus);
    }

    [TestMethod]
    public void GetScaleDigits_Returns3ForJpyPairs()
    {
        Assert.AreEqual(3, DukascopyClient.GetScaleDigits("USDJPY"));
        Assert.AreEqual(3, DukascopyClient.GetScaleDigits("EURJPY"));
    }

    [TestMethod]
    public void GetScaleDigits_Returns5ForOthers()
    {
        Assert.AreEqual(5, DukascopyClient.GetScaleDigits("EURUSD"));
    }
}

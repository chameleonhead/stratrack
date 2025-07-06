using EventFlow;
using EventFlow.EntityFramework;
using Microsoft.Extensions.DependencyInjection;
using Stratrack.Api.Domain;
using Stratrack.Api.Functions;
using Stratrack.Api.Infrastructure;
using Stratrack.Api.Models;
using Stratrack.Api.Domain.Blobs;
using Stratrack.Api.Domain.DataSources;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Text;
using System.Text.Json;
using WorkerHttpFake;

namespace Stratrack.Api.Tests;

[TestClass]
public class DataChunkFunctionsTests
{
    private static ServiceProvider CreateProvider()
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddStratrack<StratrackDbContextProvider>();
        services.AddSingleton<DataSourceFunctions>();
        services.AddSingleton<DataChunkFunctions>();
        var provider = services.BuildServiceProvider();
        using var ctx = provider.GetRequiredService<IDbContextProvider<StratrackDbContext>>().CreateContext();
        ctx.Database.EnsureDeleted();
        return provider;
    }

    private static async Task<string> CreateDataSourceAsync(
        DataSourceFunctions function,
        DataFormat format = DataFormat.Tick,
        VolumeType volume = VolumeType.None)
    {
        var req = new HttpRequestDataBuilder()
            .WithUrl("http://localhost/api/data-sources")
            .WithMethod(HttpMethod.Post)
            .WithBody(JsonSerializer.Serialize(new DataSourceCreateRequest
            {
                Name = "ds",
                Symbol = "EURUSD",
                Timeframe = "tick",
                Format = format,
                Volume = volume
            }))
            .Build();
        var res = await function.PostDataSource(req, CancellationToken.None);
        var detail = await res.ReadAsJsonAsync<DataSourceDetail>();
        return detail.Id.ToString();
    }

    [TestMethod]
    public async Task PostDataChunk_ReturnsCreated()
    {
        using var provider = CreateProvider();
        var dsFunc = provider.GetRequiredService<DataSourceFunctions>();
        var chunkFunc = provider.GetRequiredService<DataChunkFunctions>();
        var dsId = await CreateDataSourceAsync(dsFunc);

        var data = Convert.ToBase64String(Encoding.UTF8.GetBytes("time,bid,ask\n"));
        var req = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/data-sources/{dsId}/chunks")
            .WithMethod(HttpMethod.Post)
            .WithBody(JsonSerializer.Serialize(new CsvChunkUploadRequest
            {
                StartTime = new DateTimeOffset(2024,1,1,0,0,0,TimeSpan.Zero),
                EndTime = new DateTimeOffset(2024,1,1,1,0,0,TimeSpan.Zero),
                Base64Data = data
            }))
            .Build();
        var response = await chunkFunc.PostDataChunk(req, dsId, CancellationToken.None);
        Assert.AreEqual(HttpStatusCode.Created, response.StatusCode);
        using (var context = provider.GetRequiredService<IDbContextProvider<StratrackDbContext>>().CreateContext())
        {
            var chunks = await context.DataChunks.Where(c => c.DataSourceId == Guid.Parse(dsId)).ToListAsync();
            Assert.AreEqual(1, chunks.Count);
        }
    }

    [TestMethod]
    public async Task PostDataChunk_UpdatesExistingWhenOverlap()
    {
        using var provider = CreateProvider();
        var dsFunc = provider.GetRequiredService<DataSourceFunctions>();
        var chunkFunc = provider.GetRequiredService<DataChunkFunctions>();
        var dsId = await CreateDataSourceAsync(dsFunc);

        var data = Convert.ToBase64String(Encoding.UTF8.GetBytes("time,bid,ask\n"));
        var req1 = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/data-sources/{dsId}/chunks")
            .WithMethod(HttpMethod.Post)
            .WithBody(JsonSerializer.Serialize(new CsvChunkUploadRequest
            {
                StartTime = new DateTimeOffset(2024,1,1,0,0,0,TimeSpan.Zero),
                EndTime = new DateTimeOffset(2024,1,1,1,0,0,TimeSpan.Zero),
                Base64Data = data
            }))
            .Build();
        var res1 = await chunkFunc.PostDataChunk(req1, dsId, CancellationToken.None);
        Assert.AreEqual(HttpStatusCode.Created, res1.StatusCode);

        var req2 = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/data-sources/{dsId}/chunks")
            .WithMethod(HttpMethod.Post)
            .WithBody(JsonSerializer.Serialize(new CsvChunkUploadRequest
            {
                StartTime = new DateTimeOffset(2024,1,1,0,30,0,TimeSpan.Zero),
                EndTime = new DateTimeOffset(2024,1,1,1,30,0,TimeSpan.Zero),
                Base64Data = data
            }))
            .Build();
        var res2 = await chunkFunc.PostDataChunk(req2, dsId, CancellationToken.None);
        Assert.AreEqual(HttpStatusCode.Created, res2.StatusCode);

        using (var context = provider.GetRequiredService<IDbContextProvider<StratrackDbContext>>().CreateContext())
        {
            var chunks = await context.DataChunks.Where(c => c.DataSourceId == Guid.Parse(dsId)).ToListAsync();
            Assert.AreEqual(1, chunks.Count);
        }
    }

    [TestMethod]
    public async Task DeleteDataChunks_ByRange_RemovesChunks()
    {
        using var provider = CreateProvider();
        var dsFunc = provider.GetRequiredService<DataSourceFunctions>();
        var chunkFunc = provider.GetRequiredService<DataChunkFunctions>();
        var dsId = await CreateDataSourceAsync(dsFunc);

        var data = Convert.ToBase64String(Encoding.UTF8.GetBytes("time,bid,ask\n"));
        var req1 = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/data-sources/{dsId}/chunks")
            .WithMethod(HttpMethod.Post)
            .WithBody(JsonSerializer.Serialize(new CsvChunkUploadRequest
            {
                StartTime = new DateTimeOffset(2024,1,1,0,0,0,TimeSpan.Zero),
                EndTime = new DateTimeOffset(2024,1,1,1,0,0,TimeSpan.Zero),
                Base64Data = data
            }))
            .Build();
        await chunkFunc.PostDataChunk(req1, dsId, CancellationToken.None);

        var req2 = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/data-sources/{dsId}/chunks")
            .WithMethod(HttpMethod.Post)
            .WithBody(JsonSerializer.Serialize(new CsvChunkUploadRequest
            {
                StartTime = new DateTimeOffset(2024,1,1,1,0,0,TimeSpan.Zero),
                EndTime = new DateTimeOffset(2024,1,1,2,0,0,TimeSpan.Zero),
                Base64Data = data
            }))
            .Build();
        await chunkFunc.PostDataChunk(req2, dsId, CancellationToken.None);

        var delReq = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/data-sources/{dsId}/chunks?startTime=2024-01-01T00:30:00Z&endTime=2024-01-01T00:59:00Z")
            .WithMethod(HttpMethod.Delete)
            .Build();
        var delRes = await chunkFunc.DeleteDataChunks(delReq, dsId, CancellationToken.None);
        Assert.AreEqual(HttpStatusCode.NoContent, delRes.StatusCode);

        using (var context = provider.GetRequiredService<IDbContextProvider<StratrackDbContext>>().CreateContext())
        {
            var chunks = await context.DataChunks.Where(c => c.DataSourceId == Guid.Parse(dsId)).ToListAsync();
            Assert.AreEqual(1, chunks.Count);
        }
    }

    [TestMethod]
    public async Task DeleteDataChunks_DeleteAll_RemovesAll()
    {
        using var provider = CreateProvider();
        var dsFunc = provider.GetRequiredService<DataSourceFunctions>();
        var chunkFunc = provider.GetRequiredService<DataChunkFunctions>();
        var dsId = await CreateDataSourceAsync(dsFunc);

        var data = Convert.ToBase64String(Encoding.UTF8.GetBytes("time,bid,ask\n"));
        var req1 = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/data-sources/{dsId}/chunks")
            .WithMethod(HttpMethod.Post)
            .WithBody(JsonSerializer.Serialize(new CsvChunkUploadRequest
            {
                StartTime = new DateTimeOffset(2024,1,1,0,0,0,TimeSpan.Zero),
                EndTime = new DateTimeOffset(2024,1,1,1,0,0,TimeSpan.Zero),
                Base64Data = data
            }))
            .Build();
        await chunkFunc.PostDataChunk(req1, dsId, CancellationToken.None);

        var delReq = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/data-sources/{dsId}/chunks")
            .WithMethod(HttpMethod.Delete)
            .Build();
        var delRes = await chunkFunc.DeleteDataChunks(delReq, dsId, CancellationToken.None);
        Assert.AreEqual(HttpStatusCode.NoContent, delRes.StatusCode);

        using (var context = provider.GetRequiredService<IDbContextProvider<StratrackDbContext>>().CreateContext())
        {
            var chunks = await context.DataChunks.Where(c => c.DataSourceId == Guid.Parse(dsId)).ToListAsync();
            Assert.AreEqual(0, chunks.Count);
        }
    }

    [TestMethod]
    public async Task PostDataFile_SplitsIntoChunks()
    {
        using var provider = CreateProvider();
        var dsFunc = provider.GetRequiredService<DataSourceFunctions>();
        var chunkFunc = provider.GetRequiredService<DataChunkFunctions>();
        var dsId = await CreateDataSourceAsync(dsFunc);

        var csv = "time,bid,ask\n2024-01-01T00:00:00Z,1,1\n2024-01-01T01:00:00Z,1,1\n";
        var data = Convert.ToBase64String(Encoding.UTF8.GetBytes(csv));
        var req = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/data-sources/{dsId}/file")
            .WithMethod(HttpMethod.Post)
            .WithBody(JsonSerializer.Serialize(new CsvFileUploadRequest
            {
                FileName = "ohlc.csv",
                Base64Data = data
            }))
            .Build();

        var res = await chunkFunc.PostDataFile(req, dsId, CancellationToken.None);
        Assert.AreEqual(HttpStatusCode.Created, res.StatusCode);

        using (var context = provider.GetRequiredService<IDbContextProvider<StratrackDbContext>>().CreateContext())
        {
            var chunks = await context.DataChunks.Where(c => c.DataSourceId == Guid.Parse(dsId)).ToListAsync();
            Assert.AreEqual(2, chunks.Count);
        }
    }

    [TestMethod]
    public async Task PostDataFile_VariedColumns_Standardized()
    {
        using var provider = CreateProvider();
        var dsFunc = provider.GetRequiredService<DataSourceFunctions>();
        var chunkFunc = provider.GetRequiredService<DataChunkFunctions>();
        var dsId = await CreateDataSourceAsync(dsFunc);

        var csv = "bid,time,ask\n1,2024-01-01T00:00:00Z,1\n";
        var data = Convert.ToBase64String(Encoding.UTF8.GetBytes(csv));
        var req = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/data-sources/{dsId}/file")
            .WithMethod(HttpMethod.Post)
            .WithBody(JsonSerializer.Serialize(new CsvFileUploadRequest
            {
                FileName = "ohlc.csv",
                Base64Data = data
            }))
            .Build();

        var res = await chunkFunc.PostDataFile(req, dsId, CancellationToken.None);
        Assert.AreEqual(HttpStatusCode.Created, res.StatusCode);

        using var context = provider.GetRequiredService<IDbContextProvider<StratrackDbContext>>().CreateContext();
        var chunk = await context.DataChunks.FirstAsync(c => c.DataSourceId == Guid.Parse(dsId));
        var storage = provider.GetRequiredService<IBlobStorage>();
        var blob = await storage.GetAsync(chunk.BlobId, CancellationToken.None);
        var text = Encoding.UTF8.GetString(blob);
        Assert.IsTrue(text.StartsWith("time,bid,ask"));
    }

    [TestMethod]
    public async Task PostDataFile_NoHeader_Standardized()
    {
        using var provider = CreateProvider();
        var dsFunc = provider.GetRequiredService<DataSourceFunctions>();
        var chunkFunc = provider.GetRequiredService<DataChunkFunctions>();
        var dsId = await CreateDataSourceAsync(dsFunc);

        var csv = "2024-01-01T00:00:00Z,1,1\n";
        var data = Convert.ToBase64String(Encoding.UTF8.GetBytes(csv));
        var req = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/data-sources/{dsId}/file")
            .WithMethod(HttpMethod.Post)
            .WithBody(JsonSerializer.Serialize(new CsvFileUploadRequest
            {
                FileName = "ohlc.csv",
                Base64Data = data
            }))
            .Build();

        var res = await chunkFunc.PostDataFile(req, dsId, CancellationToken.None);
        Assert.AreEqual(HttpStatusCode.Created, res.StatusCode);

        using var context = provider.GetRequiredService<IDbContextProvider<StratrackDbContext>>().CreateContext();
        var chunk = await context.DataChunks.FirstAsync(c => c.DataSourceId == Guid.Parse(dsId));
        var storage = provider.GetRequiredService<IBlobStorage>();
        var blob = await storage.GetAsync(chunk.BlobId, CancellationToken.None);
        var text = Encoding.UTF8.GetString(blob);
        Assert.IsTrue(text.StartsWith("time,bid,ask"));
    }

    [TestMethod]
    public async Task PostDataFile_OhlcSplitTime_Standardized()
    {
        using var provider = CreateProvider();
        var dsFunc = provider.GetRequiredService<DataSourceFunctions>();
        var chunkFunc = provider.GetRequiredService<DataChunkFunctions>();
        var dsId = await CreateDataSourceAsync(dsFunc, DataFormat.Ohlc, VolumeType.TickCount);

        var csv = "2025.02.14,12:48,96.639,96.641,96.629,96.640,139\n";
        var data = Convert.ToBase64String(Encoding.UTF8.GetBytes(csv));
        var req = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/data-sources/{dsId}/file")
            .WithMethod(HttpMethod.Post)
            .WithBody(JsonSerializer.Serialize(new CsvFileUploadRequest
            {
                FileName = "ohlc.csv",
                Base64Data = data
            }))
            .Build();

        var res = await chunkFunc.PostDataFile(req, dsId, CancellationToken.None);
        Assert.AreEqual(HttpStatusCode.Created, res.StatusCode);

        using var context = provider.GetRequiredService<IDbContextProvider<StratrackDbContext>>().CreateContext();
        var chunk = await context.DataChunks.FirstAsync(c => c.DataSourceId == Guid.Parse(dsId));
        var storage = provider.GetRequiredService<IBlobStorage>();
        var blob = await storage.GetAsync(chunk.BlobId, CancellationToken.None);
        var text = Encoding.UTF8.GetString(blob);
        Assert.IsTrue(text.StartsWith("time,open,high,low,close,volume"));
    }
}

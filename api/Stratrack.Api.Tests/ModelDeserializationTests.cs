using System.Text.Json;
using System.Text.Json.Serialization;
using Stratrack.Api.Domain.DataSources;
using Stratrack.Api.Models;

namespace Stratrack.Api.Tests;

[TestClass]
public class ModelDeserializationTests
{
    private static JsonSerializerOptions CreateOptions()
    {
        var options = new JsonSerializerOptions
        {
            AllowTrailingCommas = true,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            PropertyNameCaseInsensitive = true,
        };
        options.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
        return options;
    }

    [TestMethod]
    public void DataSourceCreateRequest_CanDeserialize()
    {
        var json = "{\"name\":\"Dukascopy - USDJPY\",\"symbol\":\"USDJPY\",\"volume\":\"actual\",\"timeframe\":\"tick\",\"format\":\"tick\"}";
        var model = JsonSerializer.Deserialize<DataSourceCreateRequest>(json, CreateOptions())!;
        Assert.AreEqual("Dukascopy - USDJPY", model.Name);
        Assert.AreEqual("USDJPY", model.Symbol);
        Assert.AreEqual("tick", model.Timeframe);
        Assert.AreEqual(DataFormat.Tick, model.Format);
        Assert.AreEqual(VolumeType.Actual, model.Volume);
    }

    [TestMethod]
    public void DataSourceUpdateRequest_CanDeserialize()
    {
        var json = "{\"name\":\"ds\",\"description\":\"desc\",\"tags\":[\"one\"]}";
        var model = JsonSerializer.Deserialize<DataSourceUpdateRequest>(json, CreateOptions())!;
        Assert.AreEqual("ds", model.Name);
        Assert.AreEqual("desc", model.Description);
        CollectionAssert.AreEqual(new[] { "one" }, model.Tags);
    }

    [TestMethod]
    public void StrategyCreateRequest_CanDeserialize()
    {
        var json = "{\"name\":\"st\",\"description\":\"desc\",\"tags\":[\"t\"],\"template\":{\"foo\":\"bar\"},\"generatedCode\":\"code\"}";
        var model = JsonSerializer.Deserialize<StrategyCreateRequest>(json, CreateOptions())!;
        Assert.AreEqual("st", model.Name);
        Assert.AreEqual("desc", model.Description);
        CollectionAssert.AreEqual(new[] { "t" }, model.Tags);
        Assert.AreEqual("bar", model.Template.GetProperty("foo").GetString());
        Assert.AreEqual("code", model.GeneratedCode);
    }

    [TestMethod]
    public void StrategyUpdateRequest_CanDeserialize()
    {
        var json = "{\"name\":\"st\",\"description\":\"desc\",\"tags\":[\"t\"],\"template\":{\"foo\":\"bar\"},\"generatedCode\":\"code\"}";
        var model = JsonSerializer.Deserialize<StrategyUpdateRequest>(json, CreateOptions())!;
        Assert.AreEqual("st", model.Name);
        Assert.AreEqual("desc", model.Description);
        CollectionAssert.AreEqual(new[] { "t" }, model.Tags);
        Assert.AreEqual("bar", model.Template.GetProperty("foo").GetString());
        Assert.AreEqual("code", model.GeneratedCode);
    }

    [TestMethod]
    public void CsvChunkUploadRequest_CanDeserialize()
    {
        var json = "{\"startTime\":\"2024-01-01T00:00:00Z\",\"endTime\":\"2024-01-01T01:00:00Z\",\"fileName\":\"file.csv\",\"base64Data\":\"QQ==\"}";
        var model = JsonSerializer.Deserialize<CsvChunkUploadRequest>(json, CreateOptions())!;
        Assert.AreEqual(new DateTimeOffset(2024,1,1,0,0,0,TimeSpan.Zero), model.StartTime);
        Assert.AreEqual(new DateTimeOffset(2024,1,1,1,0,0,TimeSpan.Zero), model.EndTime);
        Assert.AreEqual("file.csv", model.FileName);
        Assert.AreEqual("QQ==", model.Base64Data);
    }

    [TestMethod]
    public void CsvFileUploadRequest_CanDeserialize()
    {
        var json = "{\"fileName\":\"file.csv\",\"base64Data\":\"QQ==\"}";
        var model = JsonSerializer.Deserialize<CsvFileUploadRequest>(json, CreateOptions())!;
        Assert.AreEqual("file.csv", model.FileName);
        Assert.AreEqual("QQ==", model.Base64Data);
    }
}

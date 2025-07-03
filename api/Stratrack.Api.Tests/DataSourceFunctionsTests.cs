using EventFlow;
using EventFlow.EntityFramework;
using EventFlow.Queries;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Stratrack.Api.Domain;
using Stratrack.Api.Functions;
using Stratrack.Api.Infrastructure;
using Stratrack.Api.Models;
using System.Net;
using System.Text.Json;
using WorkerHttpFake;

namespace Stratrack.Api.Tests;

[TestClass]
public class DataSourceFunctionsTests
{
    private static ServiceProvider CreateProvider()
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddStratrack<StratrackDbContextProvider>();
        services.AddSingleton<DataSourceFunctions>();
        var serviceProvider = services.BuildServiceProvider();
        using var context = serviceProvider
            .GetRequiredService<IDbContextProvider<StratrackDbContext>>()
            .CreateContext();
        context.Database.EnsureDeleted();
        return serviceProvider;
    }

    private static async Task<string> CreateDataSourceAsync(DataSourceFunctions function, DataSourceCreateRequest request)
    {
        var createRequest = new HttpRequestDataBuilder()
            .WithUrl("http://localhost/api/data-sources")
            .WithMethod(HttpMethod.Post)
            .WithBody(JsonSerializer.Serialize(request))
            .Build();

        var createResponse = await function.PostDataSource(createRequest, CancellationToken.None);
        Assert.AreEqual(HttpStatusCode.Created, createResponse.StatusCode);
        var dataSource = await createResponse.ReadAsJsonAsync<DataSourceDetail>().ConfigureAwait(false);
        return dataSource.Id.ToString();
    }

    [TestMethod]
    public async Task GetDataSources_ReturnsExpectedResponse()
    {
        // Arrange
        using var serviceProvider = CreateProvider();
        var function = serviceProvider.GetRequiredService<DataSourceFunctions>();

        var request = new HttpRequestDataBuilder()
            .WithUrl("http://localhost/api/data-sources")
            .WithMethod(HttpMethod.Get)
            .Build();

        // Act
        var response = await function.GetDataSources(request, CancellationToken.None).ConfigureAwait(false);

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        var result = await response.ReadAsJsonAsync<List<DataSourceSummary>>().ConfigureAwait(false);
        CollectionAssert.AreEqual(new List<DataSourceSummary>(), result);
    }

    [TestMethod]
    public async Task PostDataSource_ReturnsExpectedResponse()
    {
        // Arrange
        using var serviceProvider = CreateProvider();
        var function = serviceProvider.GetRequiredService<DataSourceFunctions>();

        var request = new HttpRequestDataBuilder()
            .WithUrl("http://localhost/api/data-sources")
            .WithMethod(HttpMethod.Post)
            .WithBody(JsonSerializer.Serialize(
                new DataSourceCreateRequest()
                {
                    Name = "DataSource 1",
                    Symbol = "EURUSD",
                    Timeframe = "H1",
                    Fields = new List<string>{"bid","ask"},
                    Description = "Description",
                }
            ))
            .Build();

        // Act
        var response = await function.PostDataSource(request, CancellationToken.None).ConfigureAwait(false);

        // Assert
        Assert.AreEqual(HttpStatusCode.Created, response.StatusCode);
        var obj = await response.ReadAsJsonAsync<DataSourceDetail>().ConfigureAwait(false);
        Assert.AreEqual("DataSource 1", obj.Name);
        Assert.AreEqual("EURUSD", obj.Symbol);
        Assert.AreEqual("H1", obj.Timeframe);
        CollectionAssert.AreEqual(new List<string>{"bid","ask"}, obj.Fields);
        Assert.AreEqual("Description", obj.Description);
    }

    [TestMethod]
    public async Task PostDataSource_Returns422WhenNameEmpty()
    {
        using var serviceProvider = CreateProvider();
        var function = serviceProvider.GetRequiredService<DataSourceFunctions>();

        var request = new HttpRequestDataBuilder()
            .WithUrl("http://localhost/api/data-sources")
            .WithMethod(HttpMethod.Post)
            .WithBody(JsonSerializer.Serialize(new DataSourceCreateRequest()
            {
                Name = string.Empty,
            }))
            .Build();

        var response = await function.PostDataSource(request, CancellationToken.None).ConfigureAwait(false);
        Assert.AreEqual(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    [TestMethod]
    public async Task GetDataSourceDetail_ReturnsExpectedResponse()
    {
        // Arrange
        using var serviceProvider = CreateProvider();
        var function = serviceProvider.GetRequiredService<DataSourceFunctions>();
        var id = await CreateDataSourceAsync(function, new DataSourceCreateRequest()
        {
            Name = "DataSource 1",
            Symbol = "EURUSD",
            Timeframe = "H1",
            Fields = new List<string>{"bid","ask"},
            Description = "Description",
        }).ConfigureAwait(false);

        var request = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/data-sources/{id}")
            .WithMethod(HttpMethod.Get)
            .Build();

        // Act
        var response = await function.GetDataSourceDetail(request, id, CancellationToken.None).ConfigureAwait(false);

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        var obj = await response.ReadAsJsonAsync<DataSourceDetail>().ConfigureAwait(false);
        Assert.AreEqual("DataSource 1", obj.Name);
        Assert.AreEqual("Description", obj.Description);
    }

    [TestMethod]
    public async Task PutDataSource_ReturnsExpectedResponse()
    {
        // Arrange
        using var serviceProvider = CreateProvider();
        var function = serviceProvider.GetRequiredService<DataSourceFunctions>();
        var id = await CreateDataSourceAsync(function, new DataSourceCreateRequest()
        {
            Name = "DataSource 1",
            Symbol = "EURUSD",
            Timeframe = "H1",
            Fields = new List<string>{"bid","ask"},
            Description = "Description",
        }).ConfigureAwait(false);

        var request = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/data-sources/{id}")
            .WithMethod(HttpMethod.Put)
            .WithBody(JsonSerializer.Serialize(new DataSourceUpdateRequest()
            {
                Name = "DataSource 1 Edited",
                Description = "Description Edited",
            }))
            .Build();

        // Act
        var response = await function.PutDataSource(request, id, CancellationToken.None).ConfigureAwait(false);

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        var obj = await response.ReadAsJsonAsync<DataSourceDetail>().ConfigureAwait(false);
        Assert.AreEqual("DataSource 1 Edited", obj.Name);
        Assert.AreEqual("Description Edited", obj.Description);
    }

    [TestMethod]
    public async Task PostDataSource_ReturnsInternalServerError_WhenCommandBusFails()
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddSingleton<ICommandBus, FailingCommandBus>();
        services.AddSingleton<IQueryProcessor>(new Mock<IQueryProcessor>().Object);
        services.AddSingleton<DataSourceFunctions>();
        using var provider = services.BuildServiceProvider();
        var function = provider.GetRequiredService<DataSourceFunctions>();

        var request = new HttpRequestDataBuilder()
            .WithUrl("http://localhost/api/data-sources")
            .WithMethod(HttpMethod.Post)
            .WithBody(JsonSerializer.Serialize(new DataSourceCreateRequest {
                Name = "x",
                Symbol = "EURUSD",
                Timeframe = "H1",
                Fields = new List<string>{"bid","ask"}
            }))
            .Build();

        var response = await function.PostDataSource(request, CancellationToken.None).ConfigureAwait(false);

        Assert.AreEqual(HttpStatusCode.InternalServerError, response.StatusCode);
        var body = await response.ReadAsJsonAsync<Dictionary<string, string>>().ConfigureAwait(false);
        Assert.AreEqual("Internal server error", body["error"]);
    }

    public async Task PutDataSource_Returns422WhenNameEmpty()
    {
        using var serviceProvider = CreateProvider();
        var function = serviceProvider.GetRequiredService<DataSourceFunctions>();
        var id = await CreateDataSourceAsync(function, new DataSourceCreateRequest()
        {
            Name = "name",
            Symbol = "EURUSD",
            Timeframe = "H1",
            Fields = new List<string>{"bid","ask"},
        }).ConfigureAwait(false);

        var request = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/data-sources/{id}")
            .WithMethod(HttpMethod.Put)
            .WithBody(JsonSerializer.Serialize(new DataSourceUpdateRequest()
            {
                Name = string.Empty,
            }))
            .Build();

        var response = await function.PutDataSource(request, id, CancellationToken.None).ConfigureAwait(false);
        Assert.AreEqual(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }
}

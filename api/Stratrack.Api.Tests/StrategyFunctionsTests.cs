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
public class StrategyFunctionsTests
{
    private static ServiceProvider CreateProvider()
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddStratrack<StratrackDbContextProvider>();
        services.AddSingleton<StrategyFunctions>();
        var serviceProvider = services.BuildServiceProvider();
        using var context = serviceProvider
            .GetRequiredService<IDbContextProvider<StratrackDbContext>>()
            .CreateContext();
        context.Database.EnsureDeleted();
        return serviceProvider;
    }

    private static async Task<string> CreateStrategyAsync(StrategyFunctions function, StrategyCreateRequest request)
    {
        var createRequest = new HttpRequestDataBuilder()
            .WithUrl("http://localhost/api/strategies")
            .WithMethod(HttpMethod.Post)
            .WithBody(JsonSerializer.Serialize(request))
            .Build();

        var createResponse = await function.PostStrategy(createRequest, CancellationToken.None);
        Assert.AreEqual(HttpStatusCode.Created, createResponse.StatusCode);
        var strategy = await createResponse.ReadAsJsonAsync<StrategyDetail>().ConfigureAwait(false);
        return strategy.Id.ToString();
    }

    [TestMethod]
    public async Task GetStrategies_ReturnsExpectedResponse()
    {
        // Arrange
        using var serviceProvider = CreateProvider();
        var function = serviceProvider.GetRequiredService<StrategyFunctions>();

        var request = new HttpRequestDataBuilder()
            .WithUrl("http://localhost/api/strategies")
            .WithMethod(HttpMethod.Get)
            .Build();

        // Act
        var response = await function.GetStrategies(request, CancellationToken.None).ConfigureAwait(false);

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        CollectionAssert.AreEqual(new List<StrategySummary>(), await response.ReadAsJsonAsync<List<StrategySummary>>().ConfigureAwait(false));
    }

    [TestMethod]
    public async Task PostStrategy_ReturnsExpectedResponse()
    {
        // Arrange
        using var serviceProvider = CreateProvider();
        var function = serviceProvider.GetRequiredService<StrategyFunctions>();

        var request = new HttpRequestDataBuilder()
            .WithUrl("http://localhost/api/strategies")
            .WithMethod(HttpMethod.Post)
            .WithBody(JsonSerializer.Serialize(
                new StrategyCreateRequest()
                {
                    Name = "Strategy 1",
                    Description = "Description",
                    Tags = ["tag1", "tag2"],
                    Template = new Dictionary<string, object>() {
                        {"Key1", "Value1"},
                    }.ToJsonElement(),
                    GeneratedCode = "generated code",
                }
            ))
            .Build();

        // Act
        var response = await function.PostStrategy(request, CancellationToken.None).ConfigureAwait(false);

        // Assert
        Assert.AreEqual(HttpStatusCode.Created, response.StatusCode);
        var obj = await response.ReadAsJsonAsync<StrategyDetail>().ConfigureAwait(false);
        Assert.AreEqual("Strategy 1", obj.Name);
        Assert.AreEqual("Description", obj.Description);
        CollectionAssert.AreEqual(new string[] { "tag1", "tag2" }, obj.Tags);
        Assert.AreEqual(new Dictionary<string, object>() {
            {"Key1", "Value1"},
        }.ToJsonElement().ToString(), obj.Template.ToString());
        Assert.AreEqual("generated code", obj.GeneratedCode);
    }

    [TestMethod]
    public async Task PostStrategy_Returns422WhenNameEmpty()
    {
        using var serviceProvider = CreateProvider();
        var function = serviceProvider.GetRequiredService<StrategyFunctions>();

        var request = new HttpRequestDataBuilder()
            .WithUrl("http://localhost/api/strategies")
            .WithMethod(HttpMethod.Post)
            .WithBody(JsonSerializer.Serialize(new StrategyCreateRequest()
            {
                Name = string.Empty,
            }))
            .Build();

        var response = await function.PostStrategy(request, CancellationToken.None).ConfigureAwait(false);
        Assert.AreEqual(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    [TestMethod]
    public async Task GetStrategyDetail_ReturnsExpectedResponse()
    {
        // Arrange
        using var serviceProvider = CreateProvider();
        var function = serviceProvider.GetRequiredService<StrategyFunctions>();
        var id = await CreateStrategyAsync(function, new StrategyCreateRequest()
        {
            Name = "Strategy 1",
            Description = "Description",
            Tags = ["tag1", "tag2"],
            Template = new Dictionary<string, object>() {
                {"Key1", "Value1"},
            }.ToJsonElement(),
            GeneratedCode = "generated code",
        }).ConfigureAwait(false);

        var request = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/strategies/{id}")
            .WithMethod(HttpMethod.Get)
            .Build();

        // Act
        var response = await function.GetStrategyDetail(request, id, CancellationToken.None).ConfigureAwait(false);

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        var obj = await response.ReadAsJsonAsync<StrategyDetail>().ConfigureAwait(false);
        Assert.AreEqual("Strategy 1", obj.Name);
        Assert.AreEqual("Description", obj.Description);
        CollectionAssert.AreEqual(new string[] { "tag1", "tag2" }, obj.Tags);
        Assert.AreEqual(new Dictionary<string, object>() {
            {"Key1", "Value1"},
        }.ToJsonElement().ToString(), obj.Template.ToString());
        Assert.AreEqual("generated code", obj.GeneratedCode);
    }

    [TestMethod]
    public async Task PutStrategy_ReturnsExpectedResponse()
    {
        // Arrange
        using var serviceProvider = CreateProvider();
        var function = serviceProvider.GetRequiredService<StrategyFunctions>();
        var id = await CreateStrategyAsync(function, new StrategyCreateRequest()
        {
            Name = "Strategy 1",
            Description = "Description",
            Tags = ["tag1", "tag2"],
            Template = new Dictionary<string, object>() {
                {"Key1", "Value1"},
            }.ToJsonElement(),
            GeneratedCode = "generated code",
        }).ConfigureAwait(false);

        var request = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/strategies/{id}")
            .WithMethod(HttpMethod.Put)
            .WithBody(JsonSerializer.Serialize(new StrategyUpdateRequest()
            {
                Name = "Strategy 1 Edited",
                Description = "Description Edited",
                Template = new Dictionary<string, object>() {
                    {"Key1", "Value1 Edited"}
                }.ToJsonElement(),
                GeneratedCode = "generated code edited",
            }))
            .Build();

        // Act
        var response = await function.PutStrategy(request, id, CancellationToken.None).ConfigureAwait(false);

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        var obj = await response.ReadAsJsonAsync<StrategyDetail>().ConfigureAwait(false);
        Assert.AreEqual("Strategy 1 Edited", obj.Name);
        Assert.AreEqual("Description Edited", obj.Description);
        CollectionAssert.AreEqual(new string[] {}, obj.Tags);
        Assert.AreEqual(new Dictionary<string, object>() {
            {"Key1", "Value1 Edited"},
        }.ToJsonElement().ToString(), obj.Template.ToString());
        Assert.AreEqual("generated code edited", obj.GeneratedCode);
    }

    [TestMethod]
    public async Task PostStrategy_ReturnsInternalServerError_WhenCommandBusFails()
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddSingleton<ICommandBus, FailingCommandBus>();
        services.AddSingleton<IQueryProcessor>(new Mock<IQueryProcessor>().Object);
        services.AddSingleton<StrategyFunctions>();
        using var provider = services.BuildServiceProvider();
        var function = provider.GetRequiredService<StrategyFunctions>();

        var request = new HttpRequestDataBuilder()
            .WithUrl("http://localhost/api/strategies")
            .WithMethod(HttpMethod.Post)
            .WithBody(JsonSerializer.Serialize(new StrategyCreateRequest { Name = "x" }))
            .Build();

        var response = await function.PostStrategy(request, CancellationToken.None).ConfigureAwait(false);

        Assert.AreEqual(HttpStatusCode.InternalServerError, response.StatusCode);
        var body = await response.ReadAsJsonAsync<Dictionary<string, string>>().ConfigureAwait(false);
        Assert.AreEqual("Internal server error", body["error"]);
    }

    [TestMethod]
    public async Task PutStrategy_Returns422WhenNameEmpty()
    {
        using var serviceProvider = CreateProvider();
        var function = serviceProvider.GetRequiredService<StrategyFunctions>();
        var id = await CreateStrategyAsync(function, new StrategyCreateRequest()
        {
            Name = "name",
        }).ConfigureAwait(false);

        var request = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/strategies/{id}")
            .WithMethod(HttpMethod.Put)
            .WithBody(JsonSerializer.Serialize(new StrategyUpdateRequest()
            {
                Name = string.Empty,
            }))
            .Build();

        var response = await function.PutStrategy(request, id, CancellationToken.None).ConfigureAwait(false);
        Assert.AreEqual(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }
}

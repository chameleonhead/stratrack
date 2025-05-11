using System.Net;
using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using Stratrack.Api.Domain;
using Stratrack.Api.Functions;
using Stratrack.Api.Models;
using WorkerHttpFake;

namespace Stratrack.Api.Tests;

[TestClass]
public class StrategyFunctionsTests
{
    private static ServiceProvider CreateProvider()
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddStratrack();
        services.AddSingleton<StrategyFunctions>();
        var serviceProvider = services.BuildServiceProvider();
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
        var strategy = await createResponse.ReadAsJsonAsync<StrategyDetail>();
        return strategy.Id.ToString();
    }

    [TestMethod]
    public async Task GetStrategies_ReturnsExpectedResponse()
    {
        // Arrange
        var serviceProvider = CreateProvider();
        var function = serviceProvider.GetRequiredService<StrategyFunctions>();

        var request = new HttpRequestDataBuilder()
            .WithUrl("http://localhost/api/strategies")
            .WithMethod(HttpMethod.Get)
            .Build();

        // Act
        var response = await function.GetStrategies(request, CancellationToken.None);

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        CollectionAssert.AreEqual(new List<StrategySummary>(), await response.ReadAsJsonAsync<List<StrategySummary>>());
    }

    [TestMethod]
    public async Task PostStrategy_ReturnsExpectedResponse()
    {
        // Arrange
        var serviceProvider = CreateProvider();
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
                    },
                    GeneratedCode = "generated code",
                }
            ))
            .Build();

        // Act
        var response = await function.PostStrategy(request, CancellationToken.None);

        // Assert
        Assert.AreEqual(HttpStatusCode.Created, response.StatusCode);
        var obj = await response.ReadAsJsonAsync<StrategyDetail>();
        Assert.AreEqual("Strategy 1", obj.Name);
    }

    [TestMethod]
    public async Task GetStrategyDetail_ReturnsExpectedResponse()
    {
        // Arrange
        var serviceProvider = CreateProvider();
        var function = serviceProvider.GetRequiredService<StrategyFunctions>();
        var id = await CreateStrategyAsync(function, new StrategyCreateRequest()
        {
            Name = "Strategy 1",
            Description = "Description",
            Tags = ["tag1", "tag2"],
            Template = new Dictionary<string, object>() {
                {"Key1", "Value1"},
            },
            GeneratedCode = "generated code",
        });

        var request = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/strategies/{id}")
            .WithMethod(HttpMethod.Get)
            .Build();

        // Act
        var response = await function.GetStrategyDetail(request, id, CancellationToken.None);

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        var obj = await response.ReadAsJsonAsync<StrategyDetail>();
        Assert.AreEqual("Strategy 1", obj.Name);
    }

    [TestMethod]
    public async Task PutStrategy_ReturnsExpectedResponse()
    {
        // Arrange
        var serviceProvider = CreateProvider();
        var function = serviceProvider.GetRequiredService<StrategyFunctions>();
        var id = await CreateStrategyAsync(function, new StrategyCreateRequest()
        {
            Name = "Strategy 1",
            Description = "Description",
            Tags = ["tag1", "tag2"],
            Template = new Dictionary<string, object>() {
                {"Key1", "Value1"},
            },
            GeneratedCode = "generated code",
        });

        var request = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/strategies/{id}")
            .WithMethod(HttpMethod.Put)
            .WithBody(JsonSerializer.Serialize(new StrategyUpdateRequest()
            {
                Name = "Strategy 1 Edited",
                Description = "Description Edited",
                Template = new Dictionary<string, object>() {
                    {"Key1", "Value1 Edited"}
                },
                GeneratedCode = "generated code edited",
            }))
            .Build();

        // Act
        var response = await function.PutStrategy(request, id, CancellationToken.None);

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        var obj = await response.ReadAsJsonAsync<StrategyDetail>();
        Assert.AreEqual("Strategy 1 Edited", obj.Name);
    }
}

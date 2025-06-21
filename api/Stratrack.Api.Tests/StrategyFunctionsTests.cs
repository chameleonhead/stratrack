using System.Net;
using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using Stratrack.Api.Domain;
using Stratrack.Api.Functions;
using Stratrack.Api.Infrastructure;
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
        services.AddStratrack<StratrackDbContextProvider>();
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
        var strategy = await createResponse.ReadAsJsonAsync<StrategyDetail>().ConfigureAwait(false);
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
        var response = await function.GetStrategies(request, CancellationToken.None).ConfigureAwait(false);

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        CollectionAssert.AreEqual(new List<StrategySummary>(), await response.ReadAsJsonAsync<List<StrategySummary>>().ConfigureAwait(false));
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
        var response = await function.PostStrategy(request, CancellationToken.None).ConfigureAwait(false);

        // Assert
        Assert.AreEqual(HttpStatusCode.Created, response.StatusCode);
        var obj = await response.ReadAsJsonAsync<StrategyDetail>().ConfigureAwait(false);
        Assert.AreEqual("Strategy 1", obj.Name);
    }

    [TestMethod]
    public async Task PostStrategy_Returns422WhenNameEmpty()
    {
        var serviceProvider = CreateProvider();
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
    public async Task PostStrategy_SavesTemplate()
    {
        var serviceProvider = CreateProvider();
        var function = serviceProvider.GetRequiredService<StrategyFunctions>();

        var requestBody = new StrategyCreateRequest()
        {
            Name = "With Template",
            Description = "desc",
            Tags = [],
            Template = new Dictionary<string, object>()
            {
                { "foo", 1 }
            },
            GeneratedCode = "code",
        };

        var request = new HttpRequestDataBuilder()
            .WithUrl("http://localhost/api/strategies")
            .WithMethod(HttpMethod.Post)
            .WithBody(JsonSerializer.Serialize(requestBody))
            .Build();

        var response = await function.PostStrategy(request, CancellationToken.None)
            .ConfigureAwait(false);

        Assert.AreEqual(HttpStatusCode.Created, response.StatusCode);
        var detail = await response.ReadAsJsonAsync<StrategyDetail>()
            .ConfigureAwait(false);
        Assert.IsTrue(detail.Template.ContainsKey("foo"));

        var getRequest = new HttpRequestDataBuilder()
            .WithUrl($"http://localhost/api/strategies/{detail.Id}")
            .WithMethod(HttpMethod.Get)
            .Build();

        var getResponse = await function.GetStrategyDetail(
            getRequest,
            detail.Id.ToString(),
            CancellationToken.None
        ).ConfigureAwait(false);

        Assert.AreEqual(HttpStatusCode.OK, getResponse.StatusCode);
        var fetched = await getResponse.ReadAsJsonAsync<StrategyDetail>()
            .ConfigureAwait(false);
        Assert.IsTrue(fetched.Template.ContainsKey("foo"));
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
                },
                GeneratedCode = "generated code edited",
            }))
            .Build();

        // Act
        var response = await function.PutStrategy(request, id, CancellationToken.None).ConfigureAwait(false);

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        var obj = await response.ReadAsJsonAsync<StrategyDetail>().ConfigureAwait(false);
        Assert.AreEqual("Strategy 1 Edited", obj.Name);
    }
}

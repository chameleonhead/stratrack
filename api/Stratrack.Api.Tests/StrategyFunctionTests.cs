using System.Net;
using System.Text;
using Microsoft.Extensions.DependencyInjection;
using Stratrack.Api.Functions;
using WorkerHttpFake;

namespace Stratrack.Api.Tests;

[TestClass]
public class StrategyFunctionsTests
{
    [TestMethod]
    public async Task GetStrategies_ReturnsExpectedResponse()
    {
        // Arrange
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddSingleton<StrategyFunctions>();
        var serviceProvider = services.BuildServiceProvider();

        var function = serviceProvider.GetRequiredService<StrategyFunctions>();

        var request = new HttpRequestDataBuilder()
            .WithUrl("http://localhost/api/strategies")
            .WithMethod(HttpMethod.Get)
            .Build();

        var context = request.FunctionContext;

        // Act
        var response = await function.GetStrategies(request);

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        

        response.Body.Position = 0;
        using var reader = new StreamReader(response.Body, Encoding.UTF8);
        var responseBody = await reader.ReadToEndAsync();

        Assert.AreEqual("Welcome to Azure Functions!", responseBody);
    }
}

using System.Net;
using System.Text;
using Microsoft.Extensions.DependencyInjection;
using WorkerHttpFake;

namespace Stratrack.Api.Tests;

[TestClass]
public class HelloFunctionTests
{
    [TestMethod]
    public async Task HelloFunction_ReturnsExpectedResponse()
    {
        // Arrange
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddSingleton<HelloFunction>();
        var serviceProvider = services.BuildServiceProvider();

        var function = serviceProvider.GetRequiredService<HelloFunction>();

        var request = new HttpRequestDataBuilder()
            .WithUrl("http://localhost/api/HelloFunction")
            .WithMethod(HttpMethod.Get)
            .Build();

        var context = request.FunctionContext;

        // Act
        var response = await function.Hello(request, context);

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);

        response.Body.Position = 0;
        using var reader = new StreamReader(response.Body, Encoding.UTF8);
        var responseBody = await reader.ReadToEndAsync();

        Assert.AreEqual("Welcome to Azure Functions!", responseBody);
    }
}

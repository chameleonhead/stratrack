using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using Microsoft.Azure.Functions.Worker.Http;

namespace Stratrack.Api.Tests;

public static class HttpResponseDataExtention
{
    public static async Task<string> ReadAsStringAsync(this HttpResponseData response)
    {
        response.Body.Position = 0;
        using var reader = new StreamReader(response.Body, Encoding.UTF8);
        var responseBody = await reader.ReadToEndAsync();
        return responseBody;
    }
    public static async Task<T> ReadAsJsonAsync<T>(this HttpResponseData response)
    {
        response.Body.Position = 0;
        using var reader = new StreamReader(response.Body, Encoding.UTF8);
        var responseBody = await reader.ReadToEndAsync();
        return JsonSerializer.Deserialize<T>(responseBody)!;
    }
}
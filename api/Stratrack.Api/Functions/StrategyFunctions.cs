using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.OpenApi.Models;
using System.Net;
using System.Text.Json;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Stratrack.Api.Models;

namespace Stratrack.Api.Functions;

public class StrategyFunctions
{
    [Function("GetStrategies")]
    [OpenApiOperation(operationId: "get_strategies", tags: ["Strategies"])]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(List<StrategySummary>))]
    public async Task<HttpResponseData> GetStrategies([HttpTrigger(AuthorizationLevel.Function, "get", Route = "api/strategies")] HttpRequestData req)
    {
        var response = req.CreateResponse(HttpStatusCode.OK);
        var data = new List<StrategySummary>(); // ← 仮データ（実際にはDBなどから取得する）
        await response.WriteAsJsonAsync(data);
        return response;
    }

    [Function("PostStrategy")]
    [OpenApiOperation(operationId: "post_strategy", tags: new[] { "Strategies" })]
    [OpenApiRequestBody("application/json", typeof(StrategyCreateRequest))]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Created, contentType: "application/json", bodyType: typeof(StrategyDetail))]
    public async Task<HttpResponseData> PostStrategy([HttpTrigger(AuthorizationLevel.Function, "post", Route = "strategies")] HttpRequestData req)
    {
        var body = await JsonSerializer.DeserializeAsync<StrategyCreateRequest>(req.Body);

        var response = req.CreateResponse(HttpStatusCode.Created);
        var created = new StrategyDetail()
        {
            Name = body!.Name
        }; // ← 仮データ
        await response.WriteAsJsonAsync(created);
        return response;
    }

    [Function("GetStrategyDetail")]
    [OpenApiOperation(operationId: "get_strategy_detail", tags: new[] { "Strategies" })]
    [OpenApiParameter(name: "strategyId", In = ParameterLocation.Path, Required = true, Type = typeof(string))]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(StrategyDetail))]
    public async Task<HttpResponseData> GetStrategyDetail([HttpTrigger(AuthorizationLevel.Function, "get", Route = "strategies/{strategyId}")] HttpRequestData req, string strategyId)
    {
        var response = req.CreateResponse(HttpStatusCode.OK);
        var detail = new StrategyDetail(); // ← 仮データ
        await response.WriteAsJsonAsync(detail);
        return response;
    }

    [Function("PutStrategy")]
    [OpenApiOperation(operationId: "put_strategy", tags: new[] { "Strategies" })]
    [OpenApiParameter(name: "strategyId", In = ParameterLocation.Path, Required = true, Type = typeof(string))]
    [OpenApiRequestBody("application/json", typeof(StrategyUpdateRequest))]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(StrategyDetail))]
    public async Task<HttpResponseData> PutStrategy([HttpTrigger(AuthorizationLevel.Function, "put", Route = "strategies/{strategyId}")] HttpRequestData req, string strategyId)
    {
        var body = await JsonSerializer.DeserializeAsync<StrategyUpdateRequest>(req.Body);

        var response = req.CreateResponse(HttpStatusCode.OK);
        var createdVersion = new StrategyVersionDetail(); // ← 仮データ
        await response.WriteAsJsonAsync(createdVersion);
        return response;
    }

    [Function("GetStrategyVersions")]
    [OpenApiOperation(operationId: "get_strategy_versions", tags: new[] { "Strategies" })]
    [OpenApiParameter(name: "strategyId", In = ParameterLocation.Path, Required = true, Type = typeof(string))]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(List<StrategyVersionSummary>))]
    public async Task<HttpResponseData> GetStrategyVersions([HttpTrigger(AuthorizationLevel.Function, "get", Route = "strategies/{strategyId}/versions")] HttpRequestData req, string strategyId)
    {
        var response = req.CreateResponse(HttpStatusCode.OK);
        var versions = new List<StrategyVersionSummary>(); // ← 仮データ
        await response.WriteAsJsonAsync(versions);
        return response;
    }

    [Function("GetStrategyVersion")]
    [OpenApiOperation(operationId: "get_strategy_version", tags: new[] { "Strategies" })]
    [OpenApiParameter(name: "strategyId", In = ParameterLocation.Path, Required = true, Type = typeof(string))]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(StrategyVersionDetail))]
    public async Task<HttpResponseData> GetStrategyVersion([HttpTrigger(AuthorizationLevel.Function, "post", Route = "strategies/{strategyId}/versions/{strategyVersionId}")] HttpRequestData req, string strategyId, string strategyVersionId)
    {
        var body = await JsonSerializer.DeserializeAsync<StrategyUpdateRequest>(req.Body);

        var response = req.CreateResponse(HttpStatusCode.OK);
        var createdVersion = new StrategyVersionDetail(); // ← 仮データ
        await response.WriteAsJsonAsync(createdVersion);
        return response;
    }
}

using EventFlow;
using EventFlow.Queries;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.OpenApi.Models;
using Stratrack.Api.Domain.Strategies;
using Stratrack.Api.Domain.Strategies.Commands;
using Stratrack.Api.Domain.Strategies.Queries;
using Stratrack.Api.Models;
using System.Net;

namespace Stratrack.Api.Functions;

public class StrategyFunctions(ICommandBus commandBus, IQueryProcessor queryProcessor)
{
    [Function("GetStrategies")]
    [OpenApiOperation(operationId: "get_strategies", tags: ["Strategies"])]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(List<StrategySummary>))]
    public async Task<HttpResponseData> GetStrategies([HttpTrigger(AuthorizationLevel.Function, "get", Route = "api/strategies")] HttpRequestData req, CancellationToken token)
    {
        var results = await queryProcessor.ProcessAsync(new StrategyReadModelSearchQuery(), token);
        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(results.Select(s => new StrategySummary()
        {
            Id = s.StrategyId,
            LatestVersion = s.LatestVersion ?? 0,
            LatestVersionId = s.LatestVersionId ?? Guid.Empty,
            Name = s.Name,
            CreatedAt = s.CreatedAt,
            UpdatedAt = s.UpdatedAt,
        }), token);
        return response;
    }

    [Function("PostStrategy")]
    [OpenApiOperation(operationId: "post_strategy", tags: ["Strategies"])]
    [OpenApiRequestBody("application/json", typeof(StrategyCreateRequest))]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Created, contentType: "application/json", bodyType: typeof(StrategyDetail))]
    public async Task<HttpResponseData> PostStrategy([HttpTrigger(AuthorizationLevel.Function, "post", Route = "strategies")] HttpRequestData req, CancellationToken token)
    {
        var body = await req.ReadFromJsonAsync<StrategyCreateRequest>(token);
        if (body == null)
        {
            return req.CreateResponse(HttpStatusCode.UnprocessableEntity);
        }

        var id = StrategyId.New;
        await commandBus.PublishAsync(new StrategyCreateCommand(id)
        {
            Name = body.Name,
            Description = body.Description,
            Tags = body.Tags,
            Template = body.Template,
            GeneratedCode = body.GeneratedCode,
        }, token);

        var response = req.CreateResponse(HttpStatusCode.Created);
        response.Headers.Add("Location", new Uri(req.Url, $"/api/strategies/{id.GetGuid()}").ToString());
        await response.WriteAsJsonAsync(await QueryStrategyDetail(id, token), token);
        return response;
    }

    [Function("GetStrategyDetail")]
    [OpenApiOperation(operationId: "get_strategy_detail", tags: ["Strategies"])]
    [OpenApiParameter(name: "strategyId", In = ParameterLocation.Path, Required = true, Type = typeof(string))]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(StrategyDetail))]
    public async Task<HttpResponseData> GetStrategyDetail([HttpTrigger(AuthorizationLevel.Function, "get", Route = "strategies/{strategyId}")] HttpRequestData req, string strategyId, CancellationToken token)
    {
        var result = await QueryStrategyDetail(StrategyId.With(Guid.Parse(strategyId)), token);
        if (result == null)
        {
            return req.CreateResponse(HttpStatusCode.NotFound);
        }
        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(result, token);
        return response;
    }

    [Function("PutStrategy")]
    [OpenApiOperation(operationId: "put_strategy", tags: ["Strategies"])]
    [OpenApiParameter(name: "strategyId", In = ParameterLocation.Path, Required = true, Type = typeof(string))]
    [OpenApiRequestBody("application/json", typeof(StrategyUpdateRequest))]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(StrategyDetail))]
    public async Task<HttpResponseData> PutStrategy([HttpTrigger(AuthorizationLevel.Function, "put", Route = "strategies/{strategyId}")] HttpRequestData req, string strategyId, CancellationToken token)
    {
        var body = await req.ReadFromJsonAsync<StrategyUpdateRequest>(token);
        if (body == null)
        {
            return req.CreateResponse(HttpStatusCode.UnprocessableEntity);
        }
        var id = StrategyId.With(Guid.Parse(strategyId));
        var target = await QueryStrategyDetail(StrategyId.With(Guid.Parse(strategyId)), token);
        if (target == null)
        {
            return req.CreateResponse(HttpStatusCode.NotFound);
        }

        await commandBus.PublishAsync(new StrategyUpdateCommand(id)
        {
            Name = body.Name,
            Description = body.Description,
            Tags = body.Tags,
            Template = body.Template,
            GeneratedCode = body.GeneratedCode,
        }, token);

        var response = req.CreateResponse(HttpStatusCode.OK);
        var result = await QueryStrategyDetail(StrategyId.With(Guid.Parse(strategyId)), token);
        if (result == null)
        {
            return req.CreateResponse(HttpStatusCode.NotFound);
        }
        await response.WriteAsJsonAsync(result, token);
        return response;
    }

    [Function("GetStrategyVersions")]
    [OpenApiOperation(operationId: "get_strategy_versions", tags: ["Strategies"])]
    [OpenApiParameter(name: "strategyId", In = ParameterLocation.Path, Required = true, Type = typeof(string))]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(List<StrategyVersionSummary>))]
    public async Task<HttpResponseData> GetStrategyVersions([HttpTrigger(AuthorizationLevel.Function, "get", Route = "strategies/{strategyId}/versions")] HttpRequestData req, string strategyId, CancellationToken token)
    {
        var id = StrategyId.With(Guid.Parse(strategyId));
        var results = await queryProcessor.ProcessAsync(new StrategyVersionReadModelSearchQuery()
        {
            StrategyId = id.GetGuid(),
        }, token);
        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(results.Select(sv => new StrategyVersionSummary()
        {
            Id = sv.StrategyIdGuid,
            Version = sv.Version,
            VersionId = sv.StrategyVersionIdGuid,
            CreatedAt = sv.CreatedAt,
        }), token);
        return response;
    }

    [Function("GetStrategyVersion")]
    [OpenApiOperation(operationId: "get_strategy_version", tags: ["Strategies"])]
    [OpenApiParameter(name: "strategyId", In = ParameterLocation.Path, Required = true, Type = typeof(string))]
    [OpenApiParameter(name: "strategyVersion", In = ParameterLocation.Path, Required = true, Type = typeof(int))]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(StrategyVersionDetail))]
    public async Task<HttpResponseData> GetStrategyVersion([HttpTrigger(AuthorizationLevel.Function, "get", Route = "strategies/{strategyId}/versions/{strategyVersion}")] HttpRequestData req, string strategyId, int strategyVersion, CancellationToken token)
    {
        var id = StrategyId.With(Guid.Parse(strategyId));
        var versionId = StrategyVersionId.From(id, strategyVersion);
        var result = await QueryStrategyVersionDetail(versionId, token);
        if (result == null)
        {
            return req.CreateResponse(HttpStatusCode.NotFound);
        }
        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(result, token);
        return response;
    }

    private async Task<StrategyDetail> QueryStrategyDetail(StrategyId id, CancellationToken token)
    {
        var result = await queryProcessor.ProcessAsync(new ReadModelByIdQuery<StrategyReadModel>(id), token);
        return new StrategyDetail()
        {
            Id = result.StrategyId,
            LatestVersion = result.LatestVersion,
            LatestVersionId = result.LatestVersionId,
            Name = result.Name,
            Description = result.Description,
            Tags = result.Tags,
            Template = result.Template,
            GeneratedCode = result.GeneratedCode,
            CreatedAt = result.CreatedAt,
            UpdatedAt = result.UpdatedAt,
        };
    }

    private async Task<StrategyVersionDetail?> QueryStrategyVersionDetail(StrategyVersionId id, CancellationToken token)
    {
        var result = await queryProcessor.ProcessAsync(new ReadModelByIdQuery<StrategyVersionReadModel>(id), token);
        if (result == null)
        {
            return null;
        }
        return new StrategyVersionDetail()
        {
            Id = result.StrategyIdGuid,
            Version = result.Version,
            Template = result.Template,
            GeneratedCode = result.GeneratedCode,
            CreatedAt = result.CreatedAt,
        };
    }
}

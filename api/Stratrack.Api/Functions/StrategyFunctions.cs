using EventFlow;
using EventFlow.Queries;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Enums;
using Microsoft.OpenApi.Models;
using Stratrack.Api.Domain.Strategies;
using Stratrack.Api.Domain.Strategies.Commands;
using Stratrack.Api.Domain.Strategies.Queries;
using Stratrack.Api.Models;
using System.ComponentModel.DataAnnotations;
using System.Net;
using Microsoft.Extensions.Logging;

namespace Stratrack.Api.Functions;

public class StrategyFunctions(ICommandBus commandBus, IQueryProcessor queryProcessor, ILogger<StrategyFunctions> logger)
{
    [Function("GetStrategies")]
    [OpenApiOperation(operationId: "get_strategies", tags: ["Strategies"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(List<StrategySummary>))]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Unauthorized, Description = "Not authorized")]
    public async Task<HttpResponseData> GetStrategies([HttpTrigger(AuthorizationLevel.Function, "get", Route = "strategies")] HttpRequestData req, CancellationToken token)
    {
        var results = await queryProcessor.ProcessAsync(new StrategyReadModelSearchQuery(), token).ConfigureAwait(false);
        var response = req.CreateResponse(HttpStatusCode.OK);
        var strategySummaries = results.Select(s => new StrategySummary()
        {
            Id = s.StrategyId,
            LatestVersion = s.LatestVersion ?? 0,
            LatestVersionId = s.LatestVersionId ?? Guid.Empty,
            Name = s.Name,
            CreatedAt = s.CreatedAt,
            UpdatedAt = s.UpdatedAt,
        });
        await response.WriteAsJsonAsync(strategySummaries, token).ConfigureAwait(false);
        return response;
    }

    [Function("PostStrategy")]
    [OpenApiOperation(operationId: "post_strategy", tags: ["Strategies"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiRequestBody("application/json", typeof(StrategyCreateRequest))]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Created, contentType: "application/json", bodyType: typeof(StrategyDetail))]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Unauthorized, Description = "Not authorized")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.UnprocessableEntity, Description = "Unprocessable entity")]
    public async Task<HttpResponseData> PostStrategy([HttpTrigger(AuthorizationLevel.Function, "post", Route = "strategies")] HttpRequestData req, CancellationToken token)
    {
        var body = await req.ReadFromJsonAsync<StrategyCreateRequest>(token).ConfigureAwait(false);
        if (body == null)
        {
            return req.CreateResponse(HttpStatusCode.UnprocessableEntity);
        }

        var validationResults = new List<ValidationResult>();
        if (!Validator.TryValidateObject(body, new ValidationContext(body), validationResults, true))
        {
            var errorResponse = req.CreateResponse(HttpStatusCode.UnprocessableEntity);
            await errorResponse.WriteAsJsonAsync(validationResults, token).ConfigureAwait(false);
            return errorResponse;
        }

        var id = StrategyId.New;
        try
        {
            await commandBus.PublishAsync(new StrategyCreateCommand(id)
            {
                Name = body.Name,
                Description = body.Description,
                Tags = body.Tags,
                Template = body.Template,
                GeneratedCode = body.GeneratedCode,
            }, token).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to publish StrategyCreateCommand");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(new { error = "Internal server error" }, token).ConfigureAwait(false);
            return errorResponse;
        }

        var response = req.CreateResponse(HttpStatusCode.Created);
        response.Headers.Add("Location", new Uri(req.Url, $"/api/strategies/{id.GetGuid()}").ToString());
        var strategyDetail = await QueryStrategyDetail(id, token).ConfigureAwait(false);
        await response.WriteAsJsonAsync(strategyDetail, token).ConfigureAwait(false);
        return response;
    }

    [Function("GetStrategyDetail")]
    [OpenApiOperation(operationId: "get_strategy_detail", tags: ["Strategies"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiParameter(name: "strategyId", In = ParameterLocation.Path, Required = true, Type = typeof(string))]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(StrategyDetail))]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Unauthorized, Description = "Not authorized")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NotFound, Description = "Not found")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.UnprocessableEntity, Description = "Unprocessable entity")]
    public async Task<HttpResponseData> GetStrategyDetail([HttpTrigger(AuthorizationLevel.Function, "get", Route = "strategies/{strategyId}")] HttpRequestData req, string strategyId, CancellationToken token)
    {
        var result = await QueryStrategyDetail(StrategyId.With(Guid.Parse(strategyId)), token).ConfigureAwait(false);
        if (result == null)
        {
            return req.CreateResponse(HttpStatusCode.NotFound);
        }
        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(result, token).ConfigureAwait(false);
        return response;
    }

    [Function("PutStrategy")]
    [OpenApiOperation(operationId: "put_strategy", tags: ["Strategies"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiParameter(name: "strategyId", In = ParameterLocation.Path, Required = true, Type = typeof(string))]
    [OpenApiRequestBody("application/json", typeof(StrategyUpdateRequest))]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(StrategyDetail))]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Unauthorized, Description = "Not authorized")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NotFound, Description = "Not found")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.UnprocessableEntity, Description = "Unprocessable entity")]
    public async Task<HttpResponseData> PutStrategy([HttpTrigger(AuthorizationLevel.Function, "put", Route = "strategies/{strategyId}")] HttpRequestData req, string strategyId, CancellationToken token)
    {
        var body = await req.ReadFromJsonAsync<StrategyUpdateRequest>(token).ConfigureAwait(false);
        if (body == null)
        {
            return req.CreateResponse(HttpStatusCode.UnprocessableEntity);
        }
        var validationResults = new List<ValidationResult>();
        if (!Validator.TryValidateObject(body, new ValidationContext(body), validationResults, true))
        {
            var errorResponse = req.CreateResponse(HttpStatusCode.UnprocessableEntity);
            await errorResponse.WriteAsJsonAsync(validationResults, token).ConfigureAwait(false);
            return errorResponse;
        }
        var id = StrategyId.With(Guid.Parse(strategyId));
        var target = await QueryStrategyDetail(StrategyId.With(Guid.Parse(strategyId)), token).ConfigureAwait(false);
        if (target == null)
        {
            return req.CreateResponse(HttpStatusCode.NotFound);
        }

        try
        {
            await commandBus.PublishAsync(new StrategyUpdateCommand(id)
            {
                Name = body.Name,
                Description = body.Description,
                Tags = body.Tags,
                Template = body.Template,
                GeneratedCode = body.GeneratedCode,
            }, token).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to publish StrategyUpdateCommand");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(new { error = "Internal server error" }, token).ConfigureAwait(false);
            return errorResponse;
        }

        var response = req.CreateResponse(HttpStatusCode.OK);
        var result = await QueryStrategyDetail(StrategyId.With(Guid.Parse(strategyId)), token).ConfigureAwait(false);
        if (result == null)
        {
            return req.CreateResponse(HttpStatusCode.NotFound);
        }
        await response.WriteAsJsonAsync(result, token).ConfigureAwait(false);
        return response;
    }

    [Function("GetStrategyVersions")]
    [OpenApiOperation(operationId: "get_strategy_versions", tags: ["Strategies"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiParameter(name: "strategyId", In = ParameterLocation.Path, Required = true, Type = typeof(string))]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(List<StrategyVersionSummary>))]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Unauthorized, Description = "Not authorized")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NotFound, Description = "Not found")]
    public async Task<HttpResponseData> GetStrategyVersions([HttpTrigger(AuthorizationLevel.Function, "get", Route = "strategies/{strategyId}/versions")] HttpRequestData req, string strategyId, CancellationToken token)
    {
        var id = StrategyId.With(Guid.Parse(strategyId));
        var results = await queryProcessor.ProcessAsync(new StrategyVersionReadModelSearchQuery()
        {
            StrategyId = id.GetGuid(),
        }, token).ConfigureAwait(false);
        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(results.Select(sv => new StrategyVersionSummary()
        {
            Id = sv.StrategyIdGuid,
            Version = sv.Version,
            VersionId = sv.StrategyVersionIdGuid,
            CreatedAt = sv.CreatedAt,
        }), token).ConfigureAwait(false);
        return response;
    }

    [Function("GetStrategyVersion")]
    [OpenApiOperation(operationId: "get_strategy_version", tags: ["Strategies"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiParameter(name: "strategyId", In = ParameterLocation.Path, Required = true, Type = typeof(string))]
    [OpenApiParameter(name: "strategyVersion", In = ParameterLocation.Path, Required = true, Type = typeof(int))]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(StrategyVersionDetail))]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Unauthorized, Description = "Not authorized")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NotFound, Description = "Not found")]
    public async Task<HttpResponseData> GetStrategyVersion([HttpTrigger(AuthorizationLevel.Function, "get", Route = "strategies/{strategyId}/versions/{strategyVersion}")] HttpRequestData req, string strategyId, int strategyVersion, CancellationToken token)
    {
        var id = StrategyId.With(Guid.Parse(strategyId));
        var versionId = StrategyVersionId.From(id, strategyVersion);
        var result = await QueryStrategyVersionDetail(versionId, token).ConfigureAwait(false);
        if (result == null)
        {
            return req.CreateResponse(HttpStatusCode.NotFound);
        }
        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(result, token).ConfigureAwait(false);
        return response;
    }

    [Function("DeleteStrategy")]
    [OpenApiOperation(operationId: "delete_strategy", tags: ["Strategies"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiParameter(name: "strategyId", In = ParameterLocation.Path, Required = true, Type = typeof(string))]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NoContent, Description = "No content")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Unauthorized, Description = "Not authorized")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NotFound, Description = "Not found")]
    public async Task<HttpResponseData> DeleteStrategy([HttpTrigger(AuthorizationLevel.Function, "delete", Route = "strategies/{strategyId}")] HttpRequestData req, string strategyId, CancellationToken token)
    {
        var id = StrategyId.With(Guid.Parse(strategyId));
        var result = await QueryStrategyDetail(id, token).ConfigureAwait(false);
        if (result == null)
        {
            return req.CreateResponse(HttpStatusCode.NotFound);
        }
        try
        {
            await commandBus.PublishAsync(new StrategyDeleteCommand(id), token).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to publish StrategyDeleteCommand");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(new { error = "Internal server error" }, token).ConfigureAwait(false);
            return errorResponse;
        }
        return req.CreateResponse(HttpStatusCode.NoContent);
    }

    private async Task<StrategyDetail?> QueryStrategyDetail(StrategyId id, CancellationToken token)
    {
        var result = await queryProcessor.ProcessAsync(new ReadModelByIdQuery<StrategyReadModel>(id), token).ConfigureAwait(false);
        if (result == null)
        {
            return null;
        }
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
        var result = await queryProcessor.ProcessAsync(new ReadModelByIdQuery<StrategyVersionReadModel>(id), token).ConfigureAwait(false);
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

using EventFlow;
using EventFlow.Queries;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Enums;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using Stratrack.Api.Domain.DataSources;
using Stratrack.Api.Domain.DataSources.Commands;
using Stratrack.Api.Domain.DataSources.Queries;
using Stratrack.Api.Models;
using System.ComponentModel.DataAnnotations;
using System.Net;

namespace Stratrack.Api.Functions;

public class DataSourceFunctions(ICommandBus commandBus, IQueryProcessor queryProcessor, ILogger<DataSourceFunctions> logger)
{
    [Function("GetDataSources")]
    [OpenApiOperation(operationId: "get_data_sources", tags: ["DataSources"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(List<DataSourceSummary>))]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Unauthorized, Description = "Not authorized")]
    public async Task<HttpResponseData> GetDataSources([HttpTrigger(AuthorizationLevel.Function, "get", Route = "data-sources")] HttpRequestData req, CancellationToken token)
    {
        var results = await queryProcessor.ProcessAsync(new DataSourceReadModelSearchQuery(), token).ConfigureAwait(false);
        var response = req.CreateResponse(HttpStatusCode.OK);
        var dataSourceSummaries = results.Select(s => new DataSourceSummary()
        {
            Id = s.DataSourceId,
            Name = s.Name,
            CreatedAt = s.CreatedAt,
            UpdatedAt = s.UpdatedAt,
        });
        await response.WriteAsJsonAsync(dataSourceSummaries, token).ConfigureAwait(false);
        return response;
    }

    [Function("PostDataSource")]
    [OpenApiOperation(operationId: "post_dataSource", tags: ["DataSources"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiRequestBody("application/json", typeof(DataSourceCreateRequest))]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Created, contentType: "application/json", bodyType: typeof(DataSourceDetail))]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Unauthorized, Description = "Not authorized")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.UnprocessableEntity, Description = "Unprocessable entity")]
    public async Task<HttpResponseData> PostDataSource([HttpTrigger(AuthorizationLevel.Function, "post", Route = "data-sources")] HttpRequestData req, CancellationToken token)
    {
        var body = await req.ReadFromJsonAsync<DataSourceCreateRequest>(token).ConfigureAwait(false);
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

        var id = DataSourceId.New;
        try
        {
            await commandBus.PublishAsync(new DataSourceCreateCommand(id)
            {
                Name = body.Name,
                Description = body.Description,
            }, token).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to publish DataSourceCreateCommand");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(new { error = "Internal server error" }, token).ConfigureAwait(false);
            return errorResponse;
        }

        var response = req.CreateResponse(HttpStatusCode.Created);
        response.Headers.Add("Location", new Uri(req.Url, $"/api/data-source/{id.GetGuid()}").ToString());
        var dataSourceDetail = await QueryDataSourceDetail(id, token).ConfigureAwait(false);
        await response.WriteAsJsonAsync(dataSourceDetail, token).ConfigureAwait(false);
        return response;
    }

    [Function("GetDataSourceDetail")]
    [OpenApiOperation(operationId: "get_dataSource_detail", tags: ["DataSources"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiParameter(name: "dataSourceId", In = ParameterLocation.Path, Required = true, Type = typeof(string))]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(DataSourceDetail))]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Unauthorized, Description = "Not authorized")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NotFound, Description = "Not found")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.UnprocessableEntity, Description = "Unprocessable entity")]
    public async Task<HttpResponseData> GetDataSourceDetail([HttpTrigger(AuthorizationLevel.Function, "get", Route = "data-sources/{dataSourceId}")] HttpRequestData req, string dataSourceId, CancellationToken token)
    {
        var result = await QueryDataSourceDetail(DataSourceId.With(Guid.Parse(dataSourceId)), token).ConfigureAwait(false);
        if (result == null)
        {
            return req.CreateResponse(HttpStatusCode.NotFound);
        }
        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(result, token).ConfigureAwait(false);
        return response;
    }

    [Function("PutDataSource")]
    [OpenApiOperation(operationId: "put_dataSource", tags: ["DataSources"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiParameter(name: "dataSourceId", In = ParameterLocation.Path, Required = true, Type = typeof(string))]
    [OpenApiRequestBody("application/json", typeof(DataSourceUpdateRequest))]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(DataSourceDetail))]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Unauthorized, Description = "Not authorized")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NotFound, Description = "Not found")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.UnprocessableEntity, Description = "Unprocessable entity")]
    public async Task<HttpResponseData> PutDataSource([HttpTrigger(AuthorizationLevel.Function, "put", Route = "data-sources/{dataSourceId}")] HttpRequestData req, string dataSourceId, CancellationToken token)
    {
        var body = await req.ReadFromJsonAsync<DataSourceUpdateRequest>(token).ConfigureAwait(false);
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
        var id = DataSourceId.With(Guid.Parse(dataSourceId));
        var target = await QueryDataSourceDetail(DataSourceId.With(Guid.Parse(dataSourceId)), token).ConfigureAwait(false);
        if (target == null)
        {
            return req.CreateResponse(HttpStatusCode.NotFound);
        }

        try
        {
            await commandBus.PublishAsync(new DataSourceUpdateCommand(id)
            {
                Name = body.Name,
                Description = body.Description,
            }, token).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to publish DataSourceUpdateCommand");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(new { error = "Internal server error" }, token).ConfigureAwait(false);
            return errorResponse;
        }

        var response = req.CreateResponse(HttpStatusCode.OK);
        var result = await QueryDataSourceDetail(DataSourceId.With(Guid.Parse(dataSourceId)), token).ConfigureAwait(false);
        if (result == null)
        {
            return req.CreateResponse(HttpStatusCode.NotFound);
        }
        await response.WriteAsJsonAsync(result, token).ConfigureAwait(false);
        return response;
    }

    [Function("DeleteDataSource")]
    [OpenApiOperation(operationId: "delete_dataSource", tags: ["DataSources"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiParameter(name: "dataSourceId", In = ParameterLocation.Path, Required = true, Type = typeof(string))]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NoContent, Description = "No content")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Unauthorized, Description = "Not authorized")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NotFound, Description = "Not found")]
    public async Task<HttpResponseData> DeleteDataSource([HttpTrigger(AuthorizationLevel.Function, "delete", Route = "data-sources/{dataSourceId}")] HttpRequestData req, string dataSourceId, CancellationToken token)
    {
        var id = DataSourceId.With(Guid.Parse(dataSourceId));
        var result = await QueryDataSourceDetail(id, token).ConfigureAwait(false);
        if (result == null)
        {
            return req.CreateResponse(HttpStatusCode.NotFound);
        }
        try
        {
            await commandBus.PublishAsync(new DataSourceDeleteCommand(id), token).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to publish DataSourceDeleteCommand");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(new { error = "Internal server error" }, token).ConfigureAwait(false);
            return errorResponse;
        }
        return req.CreateResponse(HttpStatusCode.NoContent);
    }

    private async Task<DataSourceDetail?> QueryDataSourceDetail(DataSourceId id, CancellationToken token)
    {
        var result = await queryProcessor.ProcessAsync(new ReadModelByIdQuery<DataSourceReadModel>(id), token).ConfigureAwait(false);
        if (result == null)
        {
            return null;
        }
        return new DataSourceDetail()
        {
            Id = result.DataSourceId,
            Name = result.Name,
            Description = result.Description,
            CreatedAt = result.CreatedAt,
            UpdatedAt = result.UpdatedAt,
        };
    }
}

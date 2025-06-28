using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Enums;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using Stratrack.Api.Domain;
using Stratrack.Api.Domain.DataSources;
using Stratrack.Api.Domain.Blobs;
using Stratrack.Api.Domain.DataSources.Commands;
using EventFlow;
using Stratrack.Api.Models;
using EventFlow.EntityFramework;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.ComponentModel.DataAnnotations;

namespace Stratrack.Api.Functions;

public class TickDataFunctions(
    IDbContextProvider<StratrackDbContext> dbContextProvider,
    IBlobStorage blobStorage,
    ICommandBus commandBus,
    ILogger<TickDataFunctions> logger)
{
    private readonly IDbContextProvider<StratrackDbContext> _dbContextProvider = dbContextProvider;
    private readonly IBlobStorage _blobStorage = blobStorage;
    private readonly ICommandBus _commandBus = commandBus;
    private readonly ILogger<TickDataFunctions> _logger = logger;
    [Function("UploadTickChunk")]
    [OpenApiOperation(operationId: "upload_tick_chunk", tags: ["TickData"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiParameter(name: "dataSourceId", In = ParameterLocation.Path, Required = true, Type = typeof(string))]
    [OpenApiRequestBody("application/json", typeof(TickChunkUploadRequest))]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Created, Description = "Created")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NotFound, Description = "Not found")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.UnprocessableEntity, Description = "Unprocessable entity")]
    public async Task<HttpResponseData> PostTickChunk(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "data-sources/{dataSourceId}/ticks")] HttpRequestData req,
        string dataSourceId,
        CancellationToken token)
    {
        var body = await req.ReadFromJsonAsync<TickChunkUploadRequest>(cancellationToken: token).ConfigureAwait(false);
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

        var dsId = Guid.Parse(dataSourceId);
        using var context = _dbContextProvider.CreateContext();
        var dataSource = await context.DataSources.FirstOrDefaultAsync(d => d.DataSourceId == dsId, token).ConfigureAwait(false);
        if (dataSource == null)
        {
            return req.CreateResponse(HttpStatusCode.NotFound);
        }

        var blobId = await _blobStorage.SaveAsync(
            body.FileName ?? $"{body.StartTime:yyyyMMddHH}.csv",
            "text/csv",
            Convert.FromBase64String(body.Base64Data),
            token).ConfigureAwait(false);

        await _commandBus.PublishAsync(new DataChunkRegisterCommand(DataSourceId.With(dataSource.DataSourceId))
        {
            BlobId = blobId,
            StartTime = body.StartTime,
            EndTime = body.EndTime,
        }, token).ConfigureAwait(false);

        return req.CreateResponse(HttpStatusCode.Created);
    }

    [Function("DeleteTickChunks")]
    [OpenApiOperation(operationId: "delete_tick_chunks", tags: ["TickData"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiParameter(name: "dataSourceId", In = ParameterLocation.Path, Required = true, Type = typeof(string))]
    [OpenApiParameter(name: "startTime", In = ParameterLocation.Query, Required = false, Type = typeof(string))]
    [OpenApiParameter(name: "endTime", In = ParameterLocation.Query, Required = false, Type = typeof(string))]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NoContent, Description = "No content")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NotFound, Description = "Not found")]
    public async Task<HttpResponseData> DeleteTickChunks(
        [HttpTrigger(AuthorizationLevel.Function, "delete", Route = "data-sources/{dataSourceId}/ticks")] HttpRequestData req,
        string dataSourceId,
        CancellationToken token)
    {
        var query = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
        var startStr = query.Get("startTime");
        var endStr = query.Get("endTime");
        DateTimeOffset? start = startStr != null ? DateTimeOffset.Parse(startStr) : null;
        DateTimeOffset? end = endStr != null ? DateTimeOffset.Parse(endStr) : null;

        var dsId = Guid.Parse(dataSourceId);
        using var context = _dbContextProvider.CreateContext();
        var dataSource = await context.DataSources.FirstOrDefaultAsync(d => d.DataSourceId == dsId, token).ConfigureAwait(false);
        if (dataSource == null)
        {
            return req.CreateResponse(HttpStatusCode.NotFound);
        }

        await _commandBus.PublishAsync(new DataChunkDeleteCommand(DataSourceId.With(dsId))
        {
            StartTime = start,
            EndTime = end,
        }, token).ConfigureAwait(false);

        return req.CreateResponse(HttpStatusCode.NoContent);
    }
}

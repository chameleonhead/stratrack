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
using Stratrack.Api.Domain.DataSources.Queries;
using EventFlow;
using Stratrack.Api.Models;
using EventFlow.Queries;
using System;
using System.Linq;
using System.Net;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Stratrack.Api.Functions;

public class DataChunkFunctions(
    IQueryProcessor queryProcessor,
    IBlobStorage blobStorage,
    ICommandBus commandBus,
    ILogger<DataChunkFunctions> logger)
{
    private readonly IQueryProcessor _queryProcessor = queryProcessor;
    private readonly IBlobStorage _blobStorage = blobStorage;
    private readonly ICommandBus _commandBus = commandBus;
    private readonly ILogger<DataChunkFunctions> _logger = logger;
    [Function("UploadDataChunk")]
    [OpenApiOperation(operationId: "upload_data_chunk", tags: ["DataChunks"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiParameter(name: "dataSourceId", In = ParameterLocation.Path, Required = true, Type = typeof(string))]
    [OpenApiRequestBody("application/json", typeof(TickChunkUploadRequest))]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Created, Description = "Created")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NotFound, Description = "Not found")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.UnprocessableEntity, Description = "Unprocessable entity")]
    public async Task<HttpResponseData> PostDataChunk(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "data-sources/{dataSourceId}/chunks")] HttpRequestData req,
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
        var dataSources = await _queryProcessor.ProcessAsync(new DataSourceReadModelSearchQuery(), token).ConfigureAwait(false);
        var dataSource = dataSources.FirstOrDefault(d => d.DataSourceId == dsId);
        if (dataSource == null)
        {
            return req.CreateResponse(HttpStatusCode.NotFound);
        }

        var blobId = await _blobStorage.SaveAsync(
            body.FileName ?? $"{body.StartTime:yyyyMMddHH}.csv",
            "text/csv",
            Convert.FromBase64String(body.Base64Data),
            token).ConfigureAwait(false);

        var chunks = await _queryProcessor.ProcessAsync(new DataChunkReadModelSearchQuery(dataSource.DataSourceId), token).ConfigureAwait(false);
        var overlap = chunks.FirstOrDefault(c => c.StartTime < body.EndTime && c.EndTime > body.StartTime);
        var chunkId = overlap?.DataChunkId ?? Guid.NewGuid();
        await _commandBus.PublishAsync(new DataChunkRegisterCommand(DataSourceId.With(dataSource.DataSourceId))
        {
            DataChunkId = chunkId,
            BlobId = blobId,
            StartTime = body.StartTime,
            EndTime = body.EndTime,
        }, token).ConfigureAwait(false);

        return req.CreateResponse(HttpStatusCode.Created);
    }

    [Function("UploadDataFile")]
    [OpenApiOperation(operationId: "upload_data_file", tags: ["DataChunks"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiParameter(name: "dataSourceId", In = ParameterLocation.Path, Required = true, Type = typeof(string))]
    [OpenApiRequestBody("application/json", typeof(TickFileUploadRequest))]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Created, Description = "Created")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NotFound, Description = "Not found")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.UnprocessableEntity, Description = "Unprocessable entity")]
    public async Task<HttpResponseData> PostDataFile(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "data-sources/{dataSourceId}/file")] HttpRequestData req,
        string dataSourceId,
        CancellationToken token)
    {
        var body = await req.ReadFromJsonAsync<TickFileUploadRequest>(cancellationToken: token).ConfigureAwait(false);
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
        var dataSources = await _queryProcessor.ProcessAsync(new DataSourceReadModelSearchQuery(), token).ConfigureAwait(false);
        var dataSource = dataSources.FirstOrDefault(d => d.DataSourceId == dsId);
        if (dataSource == null)
        {
            return req.CreateResponse(HttpStatusCode.NotFound);
        }

        var csv = Encoding.UTF8.GetString(Convert.FromBase64String(body.Base64Data));
        var lines = csv.Split('\n', StringSplitOptions.RemoveEmptyEntries);
        if (lines.Length <= 1)
        {
            return req.CreateResponse(HttpStatusCode.UnprocessableEntity);
        }
        var header = lines[0];
        var entries = lines.Skip(1)
            .Select(l => (Line: l, Time: DateTimeOffset.Parse(l.Split(',')[0])))
            .GroupBy(t => new DateTimeOffset(t.Time.Year, t.Time.Month, t.Time.Day, t.Time.Hour, 0, 0, t.Time.Offset));

        var existing = await _queryProcessor.ProcessAsync(new DataChunkReadModelSearchQuery(dsId), token).ConfigureAwait(false);
        foreach (var g in entries)
        {
            var chunkLines = string.Join('\n', new[] { header }.Concat(g.Select(e => e.Line))) + "\n";
            var blobId = await _blobStorage.SaveAsync($"{dataSource.Symbol}_{g.Key:yyyyMMddHH}.csv", "text/csv", Encoding.UTF8.GetBytes(chunkLines), token).ConfigureAwait(false);
            var start = g.Key;
            var end = g.Key.AddHours(1);
            var overlap = existing.FirstOrDefault(c => c.StartTime < end && c.EndTime > start);
            var chunkId = overlap?.DataChunkId ?? Guid.NewGuid();
            await _commandBus.PublishAsync(new DataChunkRegisterCommand(DataSourceId.With(dsId))
            {
                DataChunkId = chunkId,
                BlobId = blobId,
                StartTime = start,
                EndTime = end,
            }, token).ConfigureAwait(false);
        }

        return req.CreateResponse(HttpStatusCode.Created);
    }

    [Function("DeleteDataChunks")]
    [OpenApiOperation(operationId: "delete_data_chunks", tags: ["DataChunks"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiParameter(name: "dataSourceId", In = ParameterLocation.Path, Required = true, Type = typeof(string))]
    [OpenApiParameter(name: "startTime", In = ParameterLocation.Query, Required = false, Type = typeof(string))]
    [OpenApiParameter(name: "endTime", In = ParameterLocation.Query, Required = false, Type = typeof(string))]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NoContent, Description = "No content")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NotFound, Description = "Not found")]
    public async Task<HttpResponseData> DeleteDataChunks(
        [HttpTrigger(AuthorizationLevel.Function, "delete", Route = "data-sources/{dataSourceId}/chunks")] HttpRequestData req,
        string dataSourceId,
        CancellationToken token)
    {
        var query = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
        var startStr = query.Get("startTime");
        var endStr = query.Get("endTime");
        DateTimeOffset? start = startStr != null ? DateTimeOffset.Parse(startStr) : null;
        DateTimeOffset? end = endStr != null ? DateTimeOffset.Parse(endStr) : null;

        var dsId = Guid.Parse(dataSourceId);
        var dataSources = await _queryProcessor.ProcessAsync(new DataSourceReadModelSearchQuery(), token).ConfigureAwait(false);
        var dataSource = dataSources.FirstOrDefault(d => d.DataSourceId == dsId);
        if (dataSource == null)
        {
            return req.CreateResponse(HttpStatusCode.NotFound);
        }

        var chunks = await _queryProcessor.ProcessAsync(new DataChunkReadModelSearchQuery(dsId), token).ConfigureAwait(false);
        var target = chunks.AsEnumerable();
        if (start.HasValue && end.HasValue)
        {
            target = target.Where(c => c.StartTime < end && c.EndTime > start);
        }
        var chunkIds = target.Select(c => c.DataChunkId).ToList();
        foreach (var chunk in chunks.Where(c => chunkIds.Contains(c.DataChunkId)))
        {
            await _blobStorage.DeleteAsync(chunk.BlobId, token).ConfigureAwait(false);
        }
        if (chunkIds.Count > 0)
        {
            await _commandBus.PublishAsync(new DataChunkDeleteCommand(DataSourceId.With(dsId))
            {
                DataChunkIds = chunkIds
            }, token).ConfigureAwait(false);
        }

        return req.CreateResponse(HttpStatusCode.NoContent);
    }
}

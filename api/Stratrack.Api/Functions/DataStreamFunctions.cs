using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Enums;
using Microsoft.OpenApi.Models;
using Microsoft.Extensions.Logging;
using Stratrack.Api.Domain.Blobs;
using Stratrack.Api.Domain.DataSources;
using Stratrack.Api.Domain.DataSources.Queries;
using EventFlow.Queries;
using System.Net;
using System.Linq;
using System;

namespace Stratrack.Api.Functions;

public class DataStreamFunctions(
    IQueryProcessor queryProcessor,
    IBlobStorage blobStorage,
    ILogger<DataStreamFunctions> logger)
{
    private readonly IQueryProcessor _queryProcessor = queryProcessor;
    private readonly IBlobStorage _blobStorage = blobStorage;
    private readonly ILogger<DataStreamFunctions> _logger = logger;

    [Function("GetDataStream")]
    [OpenApiOperation(operationId: "get_data_stream", tags: ["DataSources"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiParameter(name: "dataSourceId", In = ParameterLocation.Path, Required = true, Type = typeof(string))]
    [OpenApiParameter(name: "startTime", In = ParameterLocation.Query, Required = true, Type = typeof(string))]
    [OpenApiParameter(name: "endTime", In = ParameterLocation.Query, Required = true, Type = typeof(string))]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.OK, Description = "Ok")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NotFound, Description = "Not found")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.UnprocessableEntity, Description = "Unprocessable entity")]
    public async Task<HttpResponseData> GetDataStream(
        [HttpTrigger(AuthorizationLevel.Function, "get", Route = "data-sources/{dataSourceId}/stream")] HttpRequestData req,
        string dataSourceId,
        CancellationToken token)
    {
        var query = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
        var startStr = query.Get("startTime");
        var endStr = query.Get("endTime");
        if (startStr == null || endStr == null)
        {
            return req.CreateResponse(HttpStatusCode.UnprocessableEntity);
        }

        DateTimeOffset start;
        DateTimeOffset end;
        try
        {
            start = DateTimeOffset.Parse(startStr);
            end = DateTimeOffset.Parse(endStr);
        }
        catch
        {
            return req.CreateResponse(HttpStatusCode.UnprocessableEntity);
        }

        var dsId = Guid.Parse(dataSourceId);
        var sources = await _queryProcessor.ProcessAsync(new DataSourceReadModelSearchQuery(), token).ConfigureAwait(false);
        var dataSource = sources.FirstOrDefault(d => d.DataSourceId == dsId);
        if (dataSource == null)
        {
            return req.CreateResponse(HttpStatusCode.NotFound);
        }

        var chunks = await _queryProcessor.ProcessAsync(new DataChunkReadModelSearchQuery(dsId), token).ConfigureAwait(false);
        var target = chunks
            .Where(c => c.StartTime < end && c.EndTime > start)
            .OrderBy(c => c.StartTime)
            .ToList();

        var response = req.CreateResponse(HttpStatusCode.OK);
        response.Headers.Add("Content-Type", "text/plain");
        foreach (var chunk in target)
        {
            var data = await _blobStorage.GetAsync(chunk.BlobId, token).ConfigureAwait(false);
            await response.Body.WriteAsync(data, token).ConfigureAwait(false);
        }
        return response;
    }
}

using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Enums;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using Stratrack.Api.Domain;
using Stratrack.Api.Domain.DataChunks;
using Stratrack.Api.Domain.Blobs;
using Stratrack.Api.Models;
using EventFlow.EntityFramework;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.ComponentModel.DataAnnotations;

namespace Stratrack.Api.Functions;

public class TickDataFunctions(IDbContextProvider<StratrackDbContext> dbContextProvider, ILogger<TickDataFunctions> logger)
{
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
        using var context = dbContextProvider.CreateContext();
        var dataSource = await context.DataSources.FirstOrDefaultAsync(d => d.DataSourceId == dsId, token).ConfigureAwait(false);
        if (dataSource == null)
        {
            return req.CreateResponse(HttpStatusCode.NotFound);
        }

        var blob = new BlobEntity
        {
            Id = Guid.NewGuid(),
            FileName = body.FileName ?? $"{body.StartTime:yyyyMMddHH}.csv",
            ContentType = "text/csv",
            Data = Convert.FromBase64String(body.Base64Data)
        };
        context.Blobs.Add(blob);

        var chunk = new DataChunk
        {
            Id = Guid.NewGuid(),
            DataSourceId = dataSource.DataSourceId,
            BlobId = blob.Id,
            StartTime = body.StartTime,
            EndTime = body.EndTime
        };
        context.DataChunks.Add(chunk);

        await context.SaveChangesAsync(token).ConfigureAwait(false);
        return req.CreateResponse(HttpStatusCode.Created);
    }
}

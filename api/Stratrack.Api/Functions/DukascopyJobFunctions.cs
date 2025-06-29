using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Enums;
using Microsoft.OpenApi.Models;
using System.Net;
using System.Linq;
using Stratrack.Api.Domain.Dukascopy;
using Stratrack.Api.Domain.Dukascopy.Commands;
using Stratrack.Api.Domain.Dukascopy.Queries;
using EventFlow;
using EventFlow.Queries;

namespace Stratrack.Api.Functions;

public class DukascopyJobFunctions(ICommandBus commandBus, IQueryProcessor queryProcessor, DukascopyFetchService fetchService)
{
    private readonly ICommandBus _commandBus = commandBus;
    private readonly IQueryProcessor _queryProcessor = queryProcessor;
    private readonly DukascopyFetchService _fetchService = fetchService;
    private record CreateJobRequest(string Symbol, DateTimeOffset StartTime);

    [Function("CreateDukascopyJob")]
    [OpenApiOperation(operationId: "create_dukascopy_job", tags: ["DukascopyJob"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Accepted, Description = "Created")]
    public async Task<HttpResponseData> CreateJob([HttpTrigger(AuthorizationLevel.Function, "post", Route = "dukascopy-job")] HttpRequestData req, CancellationToken token)
    {
        var body = await req.ReadFromJsonAsync<CreateJobRequest>(cancellationToken: token).ConfigureAwait(false);
        var jobId = DukascopyJobId.New;
        await _commandBus.PublishAsync(new DukascopyJobCreateCommand(jobId)
        {
            Symbol = body?.Symbol ?? string.Empty,
            StartTime = body?.StartTime ?? DateTimeOffset.UtcNow
        }, token).ConfigureAwait(false);
        var res = req.CreateResponse(HttpStatusCode.Accepted);
        await res.WriteAsJsonAsync(new { id = jobId.GetGuid() }, cancellationToken: token).ConfigureAwait(false);
        return res;
    }

    [Function("StartDukascopyJob")]
    [OpenApiOperation(operationId: "start_dukascopy_job", tags: ["DukascopyJob"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Accepted, Description = "Started")]
    public async Task<HttpResponseData> StartJob([HttpTrigger(AuthorizationLevel.Function, "post", Route = "dukascopy-job/{id:guid}/start")] HttpRequestData req, Guid id, CancellationToken token)
    {
        await _commandBus.PublishAsync(new DukascopyJobStartCommand(DukascopyJobId.With(id)), token).ConfigureAwait(false);
        var res = req.CreateResponse(HttpStatusCode.Accepted);
        return res;
    }

    [Function("StopDukascopyJob")]
    [OpenApiOperation(operationId: "stop_dukascopy_job", tags: ["DukascopyJob"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Accepted, Description = "Stopped")]
    public async Task<HttpResponseData> StopJob([HttpTrigger(AuthorizationLevel.Function, "post", Route = "dukascopy-job/{id:guid}/stop")] HttpRequestData req, Guid id, CancellationToken token)
    {
        await _commandBus.PublishAsync(new DukascopyJobStopCommand(DukascopyJobId.With(id)), token).ConfigureAwait(false);
        var res = req.CreateResponse(HttpStatusCode.Accepted);
        return res;
    }

    [Function("DeleteDukascopyJob")]
    [OpenApiOperation(operationId: "delete_dukascopy_job", tags: ["DukascopyJob"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Accepted, Description = "Deleted")]
    public async Task<HttpResponseData> DeleteJob([HttpTrigger(AuthorizationLevel.Function, "delete", Route = "dukascopy-job/{id:guid}")] HttpRequestData req, Guid id, CancellationToken token)
    {
        await _commandBus.PublishAsync(new DukascopyJobDeleteCommand(DukascopyJobId.With(id)), token).ConfigureAwait(false);
        var res = req.CreateResponse(HttpStatusCode.Accepted);
        return res;
    }

    [Function("DukascopyJobTimer")]
    public async Task RunJob([TimerTrigger("0 0 */12 * * *")] string timerInfo, CancellationToken token)
    {
        var jobs = await _queryProcessor.ProcessAsync(new DukascopyJobReadModelSearchQuery(), token).ConfigureAwait(false);
        foreach (var job in jobs.Where(j => !j.IsDeleted && j.IsRunning))
        {
            await _fetchService.FetchAsync(job.Symbol, job.StartTime, token).ConfigureAwait(false);
        }
    }
}


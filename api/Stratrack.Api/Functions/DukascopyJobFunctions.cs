using EventFlow;
using EventFlow.Queries;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Enums;
using Microsoft.DurableTask.Client;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using Stratrack.Api.Domain.DataSources;
using Stratrack.Api.Domain.DataSources.Commands;
using Stratrack.Api.Domain.Dukascopy;
using Stratrack.Api.Domain.Dukascopy.Commands;
using Stratrack.Api.Domain.Dukascopy.Queries;
using System.Net;
using System.Web;

namespace Stratrack.Api.Functions;

public class DukascopyJobFunctions(
    ICommandBus commandBus,
    IQueryProcessor queryProcessor,
    DukascopyFetchService fetchService,
    ILogger<DukascopyJobFunctions> logger)
{
    private readonly ICommandBus _commandBus = commandBus;
    private readonly IQueryProcessor _queryProcessor = queryProcessor;
    private readonly DukascopyFetchService _fetchService = fetchService;
    private readonly ILogger<DukascopyJobFunctions> _logger = logger;
    private record CreateJobRequest(string Symbol, DateTimeOffset StartTime);

    [Function(nameof(CreateDukascopyJob))]
    [OpenApiOperation(operationId: "create_dukascopy_job", tags: ["DukascopyJob"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Accepted, Description = "Created")]
    public async Task<HttpResponseData> CreateDukascopyJob([HttpTrigger(AuthorizationLevel.Function, "post", Route = "dukascopy-job")] HttpRequestData req, CancellationToken token)
    {
        var body = await req.ReadFromJsonAsync<CreateJobRequest>(cancellationToken: token).ConfigureAwait(false);
        var jobId = DukascopyJobId.New;
        var dataSourceId = DataSourceId.New;

        await _commandBus.PublishAsync(new DukascopyJobCreateCommand(jobId)
        {
            Symbol = body?.Symbol ?? string.Empty,
            StartTime = body?.StartTime ?? DateTimeOffset.UtcNow
        }, token).ConfigureAwait(false);

        await _commandBus.PublishAsync(new DataSourceCreateCommand(dataSourceId)
        {
            Name = $"Dukascopy {body?.Symbol}",
            Symbol = body?.Symbol ?? string.Empty,
            Timeframe = "tick",
            Format = DataFormat.Tick,
            Volume = VolumeType.None,
            Fields = new List<string> { "bid", "ask" },
            Description = "Dukascopy auto generated"
        }, token).ConfigureAwait(false);

        await _commandBus.PublishAsync(new DukascopyJobUpdateCommand(jobId)
        {
            DataSourceId = dataSourceId.GetGuid(),
            StartTime = body?.StartTime ?? DateTimeOffset.UtcNow
        }, token).ConfigureAwait(false);
        var res = req.CreateResponse(HttpStatusCode.Accepted);
        await res.WriteAsJsonAsync(new { id = jobId.GetGuid(), dataSourceId = dataSourceId.GetGuid() }, cancellationToken: token).ConfigureAwait(false);
        return res;
    }

    private record UpdateJobRequest(Guid DataSourceId, DateTimeOffset StartTime);

    [Function(nameof(UpdateDukascopyJob))]
    [OpenApiOperation(operationId: "update_dukascopy_job", tags: ["DukascopyJob"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Accepted, Description = "Updated")]
    public async Task<HttpResponseData> UpdateDukascopyJob([HttpTrigger(AuthorizationLevel.Function, "put", Route = "dukascopy-job/{id:guid}")] HttpRequestData req, Guid id, CancellationToken token)
    {
        var body = await req.ReadFromJsonAsync<UpdateJobRequest>(cancellationToken: token).ConfigureAwait(false);
        await _commandBus.PublishAsync(new DukascopyJobUpdateCommand(DukascopyJobId.With(id))
        {
            DataSourceId = body?.DataSourceId ?? Guid.Empty,
            StartTime = body?.StartTime ?? DateTimeOffset.UtcNow
        }, token).ConfigureAwait(false);
        return req.CreateResponse(HttpStatusCode.Accepted);
    }

    [Function(nameof(EnableDukascopyJob))]
    [OpenApiOperation(operationId: "enable_dukascopy_job", tags: ["DukascopyJob"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Accepted, Description = "Enabled")]
    public async Task<HttpResponseData> EnableDukascopyJob(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "dukascopy-job/{id:guid}/enable")] HttpRequestData req,
        Guid id,
        CancellationToken token)
    {
        var jobs = await _queryProcessor.ProcessAsync(new DukascopyJobReadModelSearchQuery(), token).ConfigureAwait(false);
        var job = jobs.FirstOrDefault(j => j.JobId == id);
        if (job == null)
        {
            return req.CreateResponse(HttpStatusCode.NotFound);
        }
        if (job.IsRunning)
        {
            return req.CreateResponse(HttpStatusCode.Accepted);
        }
        await _commandBus.PublishAsync(new DataSourceLockCommand(DataSourceId.With(job.DataSourceId)), token).ConfigureAwait(false);
        await _commandBus.PublishAsync(new DukascopyJobEnableCommand(DukascopyJobId.With(id)), token).ConfigureAwait(false);
        var res = req.CreateResponse(HttpStatusCode.Accepted);
        return res;
    }

    [Function(nameof(DisableDukascopyJob))]
    [OpenApiOperation(operationId: "disable_dukascopy_job", tags: ["DukascopyJob"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Accepted, Description = "Disabled")]
    public async Task<HttpResponseData> DisableDukascopyJob(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "dukascopy-job/{id:guid}/disable")] HttpRequestData req,
        Guid id,
        [DurableClient] DurableTaskClient client,
        CancellationToken token)
    {
        var jobs = await _queryProcessor.ProcessAsync(new DukascopyJobReadModelSearchQuery(), token).ConfigureAwait(false);
        var job = jobs.FirstOrDefault(j => j.JobId == id);
        if (job != null)
        {
            if (job.CurrentExecutionId != null)
            {
                var instance = await client.GetInstanceAsync(job.CurrentExecutionId.Value.ToString(), token).ConfigureAwait(false);
                if (instance != null && instance.RuntimeStatus is not (OrchestrationRuntimeStatus.Completed or OrchestrationRuntimeStatus.Failed or OrchestrationRuntimeStatus.Canceled or OrchestrationRuntimeStatus.Terminated))
                {
                    await client.TerminateInstanceAsync(job.CurrentExecutionId.Value.ToString(), "disable", token);
                }
                if (job.IsRunning)
                {
                    await _commandBus.PublishAsync(new DukascopyJobExecutionInterruptCommand(DukascopyJobId.With(id))
                    {
                        ExecutionId = job.CurrentExecutionId.Value,
                        ErrorMessage = "Interrupted"
                    }, token).ConfigureAwait(false);
                }
            }
            await _commandBus.PublishAsync(new DataSourceUnlockCommand(DataSourceId.With(job.DataSourceId)), token).ConfigureAwait(false);
        }
        await _commandBus.PublishAsync(new DukascopyJobDisableCommand(DukascopyJobId.With(id)), token).ConfigureAwait(false);
        var res = req.CreateResponse(HttpStatusCode.Accepted);
        return res;
    }

    [Function(nameof(DeleteDukascopyJob))]
    [OpenApiOperation(operationId: "delete_dukascopy_job", tags: ["DukascopyJob"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Accepted, Description = "Deleted")]
    public async Task<HttpResponseData> DeleteDukascopyJob([HttpTrigger(AuthorizationLevel.Function, "delete", Route = "dukascopy-job/{id:guid}")] HttpRequestData req, Guid id, CancellationToken token)
    {
        await _commandBus.PublishAsync(new DukascopyJobDeleteCommand(DukascopyJobId.With(id)), token).ConfigureAwait(false);
        var res = req.CreateResponse(HttpStatusCode.Accepted);
        return res;
    }

    [Function(nameof(GetDukascopyJobs))]
    [OpenApiOperation(operationId: "get_dukascopy_jobs", tags: ["DukascopyJob"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(List<Models.DukascopyJobSummary>))]
    public async Task<HttpResponseData> GetDukascopyJobs([HttpTrigger(AuthorizationLevel.Function, "get", Route = "dukascopy-job")] HttpRequestData req, CancellationToken token)
    {
        var jobs = await _queryProcessor.ProcessAsync(new DukascopyJobReadModelSearchQuery(), token).ConfigureAwait(false);
        var summaries = jobs
            .Where(j => !j.IsDeleted)
            .Select(j => new Models.DukascopyJobSummary
            {
                Id = j.JobId,
                DataSourceId = j.DataSourceId,
                Symbol = j.Symbol,
                StartTime = j.StartTime,
                IsEnabled = j.IsEnabled,
                IsRunning = j.IsRunning,
                InterruptRequested = j.InterruptRequested,
                LastExecutionStartedAt = j.LastExecutionStartedAt,
                LastExecutionFinishedAt = j.LastExecutionFinishedAt,
                LastExecutionSucceeded = j.LastExecutionSucceeded,
                LastExecutionError = j.LastExecutionError,
                UpdatedAt = j.UpdatedAt,
            }).ToList();
        var res = req.CreateResponse(HttpStatusCode.OK);
        await res.WriteAsJsonAsync(summaries, cancellationToken: token).ConfigureAwait(false);
        return res;
    }

    [Function(nameof(GetDukascopyJobLogs))]
    [OpenApiOperation(operationId: "get_dukascopy_job_logs", tags: ["DukascopyJob"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiParameter(name: "page", In = ParameterLocation.Query, Required = false, Type = typeof(int))]
    [OpenApiParameter(name: "pageSize", In = ParameterLocation.Query, Required = false, Type = typeof(int))]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(List<Models.DukascopyJobLog>))]
    public async Task<HttpResponseData> GetDukascopyJobLogs([HttpTrigger(AuthorizationLevel.Function, "get", Route = "dukascopy-job/{id:guid}/logs")] HttpRequestData req, Guid id, CancellationToken token)
    {
        var query = HttpUtility.ParseQueryString(req.Url.Query);
        var page = int.TryParse(query.Get("page"), out var p) ? p : 1;
        var pageSize = int.TryParse(query.Get("pageSize"), out var s) ? s : 100;
        var logs = await _queryProcessor.ProcessAsync(new DukascopyJobFetchResultPagedQuery(null, page, pageSize), token).ConfigureAwait(false);
        var items = logs.Select(l => new Models.DukascopyJobLog
        {
            FileUrl = l.FileUrl,
            HttpStatus = l.HttpStatus,
            ETag = l.ETag,
            LastModified = l.LastModified
        }).ToList();
        var res = req.CreateResponse(HttpStatusCode.OK);
        await res.WriteAsJsonAsync(items, cancellationToken: token).ConfigureAwait(false);
        return res;
    }


    [Function(nameof(GetAllDukascopyJobLogs))]
    [OpenApiOperation(operationId: "get_all_dukascopy_job_logs", tags: ["DukascopyJob"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiParameter(name: "page", In = ParameterLocation.Query, Required = false, Type = typeof(int))]
    [OpenApiParameter(name: "pageSize", In = ParameterLocation.Query, Required = false, Type = typeof(int))]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(List<Models.DukascopyJobLog>))]
    public async Task<HttpResponseData> GetAllDukascopyJobLogs([HttpTrigger(AuthorizationLevel.Function, "get", Route = "dukascopy-job/logs")] HttpRequestData req, CancellationToken token)
    {
        var query = HttpUtility.ParseQueryString(req.Url.Query);
        var page = int.TryParse(query.Get("page"), out var p) ? p : 1;
        var pageSize = int.TryParse(query.Get("pageSize"), out var s) ? s : 100;
        var logs = await _queryProcessor.ProcessAsync(new DukascopyJobFetchResultPagedQuery(null, page, pageSize), token).ConfigureAwait(false);
        var items = logs.Select(l => new Models.DukascopyJobLog
        {
            FileUrl = l.FileUrl,
            HttpStatus = l.HttpStatus,
            ETag = l.ETag,
            LastModified = l.LastModified
        }).ToList();
        var res = req.CreateResponse(HttpStatusCode.OK);
        await res.WriteAsJsonAsync(items, cancellationToken: token).ConfigureAwait(false);
        return res;
    }

}


using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Enums;
using Microsoft.OpenApi.Models;
using Microsoft.Extensions.Logging;
using Microsoft.DurableTask;
using Microsoft.DurableTask.Client;
using System.Net;
using System.Linq;
using System.Collections.Generic;
using Stratrack.Api.Domain.Dukascopy;
using Stratrack.Api.Domain.Dukascopy.Commands;
using Stratrack.Api.Domain.Dukascopy.Queries;
using Stratrack.Api.Domain.DataSources;
using Stratrack.Api.Domain.DataSources.Commands;
using Stratrack.Api.Domain.DataSources.Queries;
using EventFlow;
using EventFlow.Queries;

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

    [Function("CreateDukascopyJob")]
    [OpenApiOperation(operationId: "create_dukascopy_job", tags: ["DukascopyJob"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Accepted, Description = "Created")]
    public async Task<HttpResponseData> CreateJob([HttpTrigger(AuthorizationLevel.Function, "post", Route = "dukascopy-job")] HttpRequestData req, CancellationToken token)
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

    [Function("UpdateDukascopyJob")]
    [OpenApiOperation(operationId: "update_dukascopy_job", tags: ["DukascopyJob"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Accepted, Description = "Updated")]
    public async Task<HttpResponseData> UpdateJob([HttpTrigger(AuthorizationLevel.Function, "put", Route = "dukascopy-job/{id:guid}")] HttpRequestData req, Guid id, CancellationToken token)
    {
        var body = await req.ReadFromJsonAsync<UpdateJobRequest>(cancellationToken: token).ConfigureAwait(false);
        await _commandBus.PublishAsync(new DukascopyJobUpdateCommand(DukascopyJobId.With(id))
        {
            DataSourceId = body?.DataSourceId ?? Guid.Empty,
            StartTime = body?.StartTime ?? DateTimeOffset.UtcNow
        }, token).ConfigureAwait(false);
        return req.CreateResponse(HttpStatusCode.Accepted);
    }

    [Function("EnableDukascopyJob")]
    [OpenApiOperation(operationId: "enable_dukascopy_job", tags: ["DukascopyJob"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Accepted, Description = "Enabled")]
    public async Task<HttpResponseData> EnableJob(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "dukascopy-job/{id:guid}/enable")] HttpRequestData req,
        Guid id,
        [DurableClient] DurableTaskClient client,
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
        await client.ScheduleNewOrchestrationInstanceAsync(
            "DukascopyJobOrchestrator",
            new[] { new DukascopyJobInput(job.JobId, job.DataSourceId, job.Symbol, job.StartTime) },
            token);
        var res = req.CreateResponse(HttpStatusCode.Accepted);
        return res;
    }

    [Function("DisableDukascopyJob")]
    [OpenApiOperation(operationId: "disable_dukascopy_job", tags: ["DukascopyJob"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Accepted, Description = "Disabled")]
    public async Task<HttpResponseData> DisableJob([HttpTrigger(AuthorizationLevel.Function, "post", Route = "dukascopy-job/{id:guid}/disable")] HttpRequestData req, Guid id, CancellationToken token)
    {
        var jobs = await _queryProcessor.ProcessAsync(new DukascopyJobReadModelSearchQuery(), token).ConfigureAwait(false);
        var job = jobs.FirstOrDefault(j => j.JobId == id);
        if (job != null)
        {
            await _commandBus.PublishAsync(new DataSourceUnlockCommand(DataSourceId.With(job.DataSourceId)), token).ConfigureAwait(false);
        }
        await _commandBus.PublishAsync(new DukascopyJobDisableCommand(DukascopyJobId.With(id)), token).ConfigureAwait(false);
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

    [Function("GetDukascopyJobs")]
    [OpenApiOperation(operationId: "get_dukascopy_jobs", tags: ["DukascopyJob"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(List<Models.DukascopyJobSummary>))]
    public async Task<HttpResponseData> GetJobs([HttpTrigger(AuthorizationLevel.Function, "get", Route = "dukascopy-job")] HttpRequestData req, CancellationToken token)
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
                LastProcessStartedAt = j.LastProcessStartedAt,
                LastProcessFinishedAt = j.LastProcessFinishedAt,
                LastProcessSucceeded = j.LastProcessSucceeded,
                LastProcessError = j.LastProcessError,
                UpdatedAt = j.UpdatedAt,
            }).ToList();
        var res = req.CreateResponse(HttpStatusCode.OK);
        await res.WriteAsJsonAsync(summaries, cancellationToken: token).ConfigureAwait(false);
        return res;
    }

    [Function("GetDukascopyJobLogs")]
    [OpenApiOperation(operationId: "get_dukascopy_job_logs", tags: ["DukascopyJob"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(List<Models.DukascopyJobLog>))]
    public async Task<HttpResponseData> GetJobLogs([HttpTrigger(AuthorizationLevel.Function, "get", Route = "dukascopy-job/{id:guid}/logs")] HttpRequestData req, Guid id, CancellationToken token)
    {
        var logs = await _queryProcessor.ProcessAsync(new DukascopyJobStepReadModelSearchQuery(id, DateTimeOffset.UtcNow.AddDays(-7)), token).ConfigureAwait(false);
        var items = logs.Select(l => new Models.DukascopyJobLog
        {
            ExecutedAt = l.ExecutedAt,
            IsSuccess = l.IsSuccess,
            Symbol = l.Symbol,
            TargetTime = l.TargetTime,
            ErrorMessage = l.ErrorMessage,
            Duration = l.Duration
        }).ToList();
        var res = req.CreateResponse(HttpStatusCode.OK);
        await res.WriteAsJsonAsync(items, cancellationToken: token).ConfigureAwait(false);
        return res;
    }


    [Function("GetAllDukascopyJobLogs")]
    [OpenApiOperation(operationId: "get_all_dukascopy_job_logs", tags: ["DukascopyJob"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiParameter(name: "page", In = ParameterLocation.Query, Required = false, Type = typeof(int))]
    [OpenApiParameter(name: "pageSize", In = ParameterLocation.Query, Required = false, Type = typeof(int))]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(List<Models.DukascopyJobLog>))]
    public async Task<HttpResponseData> GetAllJobLogs([HttpTrigger(AuthorizationLevel.Function, "get", Route = "dukascopy-job/logs")] HttpRequestData req, CancellationToken token)
    {
        var query = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
        var page = int.TryParse(query.Get("page"), out var p) ? p : 1;
        var pageSize = int.TryParse(query.Get("pageSize"), out var s) ? s : 100;
        var logs = await _queryProcessor.ProcessAsync(new DukascopyJobStepPagedQuery(page, pageSize), token).ConfigureAwait(false);
        var items = logs.Select(l => new Models.DukascopyJobLog
        {
            ExecutedAt = l.ExecutedAt,
            IsSuccess = l.IsSuccess,
            Symbol = l.Symbol,
            TargetTime = l.TargetTime,
            ErrorMessage = l.ErrorMessage,
            Duration = l.Duration
        }).ToList();
        var res = req.CreateResponse(HttpStatusCode.OK);
        await res.WriteAsJsonAsync(items, cancellationToken: token).ConfigureAwait(false);
        return res;
    }

}


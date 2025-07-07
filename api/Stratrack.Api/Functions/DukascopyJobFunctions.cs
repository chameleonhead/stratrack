using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Enums;
using Microsoft.OpenApi.Models;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Linq;
using System.Collections.Generic;
using Stratrack.Api.Domain.Dukascopy;
using Stratrack.Api.Domain.Dukascopy.Commands;
using Stratrack.Api.Domain.Dukascopy.Queries;
using Stratrack.Api.Domain.DataSources;
using Stratrack.Api.Domain.DataSources.Commands;
using EventFlow;
using EventFlow.Queries;

namespace Stratrack.Api.Functions;

public class DukascopyJobFunctions(ICommandBus commandBus, IQueryProcessor queryProcessor, DukascopyFetchService fetchService, ILogger<DukascopyJobFunctions> logger)
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

    [Function("StartDukascopyJob")]
    [OpenApiOperation(operationId: "start_dukascopy_job", tags: ["DukascopyJob"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Accepted, Description = "Started")]
    public async Task<HttpResponseData> StartJob([HttpTrigger(AuthorizationLevel.Function, "post", Route = "dukascopy-job/{id:guid}/start")] HttpRequestData req, Guid id, CancellationToken token)
    {
        var jobs = await _queryProcessor.ProcessAsync(new DukascopyJobReadModelSearchQuery(), token).ConfigureAwait(false);
        var job = jobs.FirstOrDefault(j => j.JobId == id);
        if (job == null)
        {
            return req.CreateResponse(HttpStatusCode.NotFound);
        }
        await _commandBus.PublishAsync(new DataSourceLockCommand(DataSourceId.With(job.DataSourceId)), token).ConfigureAwait(false);
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
        var jobs = await _queryProcessor.ProcessAsync(new DukascopyJobReadModelSearchQuery(), token).ConfigureAwait(false);
        var job = jobs.FirstOrDefault(j => j.JobId == id);
        if (job != null)
        {
            await _commandBus.PublishAsync(new DataSourceUnlockCommand(DataSourceId.With(job.DataSourceId)), token).ConfigureAwait(false);
        }
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
                IsRunning = j.IsRunning,
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
        var logs = await _queryProcessor.ProcessAsync(new DukascopyJobExecutionReadModelSearchQuery(id, DateTimeOffset.UtcNow.AddDays(-7)), token).ConfigureAwait(false);
        var items = logs.Select(l => new Models.DukascopyJobLog { ExecutedAt = l.ExecutedAt, IsSuccess = l.IsSuccess }).ToList();
        var res = req.CreateResponse(HttpStatusCode.OK);
        await res.WriteAsJsonAsync(items, cancellationToken: token).ConfigureAwait(false);
        return res;
    }

    [Function("DukascopyJobTimer")]
    public async Task RunJob([TimerTrigger("0 0 */12 * * *")] string timerInfo, CancellationToken token)
    {
        _logger.LogInformation("DukascopyJobTimer triggered at {Time}", DateTimeOffset.UtcNow);
        var jobs = await _queryProcessor.ProcessAsync(new DukascopyJobReadModelSearchQuery(), token).ConfigureAwait(false);
        foreach (var job in jobs.Where(j => !j.IsDeleted && j.IsRunning))
        {
            _logger.LogInformation("Running job {JobId}", job.JobId);
            await _fetchService.FetchAsync(job.JobId, job.DataSourceId, job.Symbol, job.StartTime, token).ConfigureAwait(false);
        }
        _logger.LogInformation("DukascopyJobTimer finished at {Time}", DateTimeOffset.UtcNow);
    }
}


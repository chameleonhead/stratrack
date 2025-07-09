using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Enums;
using Microsoft.OpenApi.Models;
using Microsoft.DurableTask;
using Microsoft.DurableTask.Client;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Linq;
using Stratrack.Api.Domain.Dukascopy;
using Stratrack.Api.Domain.Dukascopy.Commands;
using Stratrack.Api.Domain.Dukascopy.Queries;
using Stratrack.Api.Domain.DataSources.Queries;
using EventFlow;
using EventFlow.Queries;

namespace Stratrack.Api.Functions;

public record DukascopyJobInput(Guid JobId, Guid DataSourceId, string Symbol, DateTimeOffset StartTime);
public record DukascopyJobExecutionInput(Guid JobId, Guid DataSourceId, string Symbol, DateTimeOffset StartTime, Guid ExecutionId);
public record DukascopyJobStartInput(Guid JobId, Guid ExecutionId);
public record DukascopyJobHourInput(Guid JobId, Guid DataSourceId, string Symbol, DateTimeOffset Time, Guid ExecutionId);
public record DukascopyJobFinishInput(Guid JobId, Guid ExecutionId, bool Success, string? Error);

public class DukascopyJobExecutionFunctions(
    ICommandBus commandBus,
    IQueryProcessor queryProcessor,
    DukascopyFetchService fetchService,
    ILogger<DukascopyJobExecutionFunctions> logger)
{
    private readonly ICommandBus _commandBus = commandBus;
    private readonly IQueryProcessor _queryProcessor = queryProcessor;
    private readonly DukascopyFetchService _fetchService = fetchService;
    private readonly ILogger<DukascopyJobExecutionFunctions> _logger = logger;


    [Function("StartDukascopyJobExecution")]
    [OpenApiOperation(operationId: "start_dukascopy_job_execution", tags: ["DukascopyJob"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Accepted, Description = "Started")]
    public async Task<HttpResponseData> StartExecution(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "dukascopy-job/{id:guid}/execute")] HttpRequestData req,
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

        await client.ScheduleNewOrchestrationInstanceAsync(
            "DukascopyJobOrchestrator",
            new[] { new DukascopyJobInput(job.JobId, job.DataSourceId, job.Symbol, job.StartTime) },
            token);
        return req.CreateResponse(HttpStatusCode.Accepted);
    }

    [Function("DukascopyJobOrchestrator")]
    public async Task RunOrchestrator([OrchestrationTrigger] TaskOrchestrationContext context)
    {
        var jobs = context.GetInput<IReadOnlyList<DukascopyJobInput>>();
        if (jobs == null || jobs.Count == 0)
        {
            return;
        }

        var tasks = new List<Task>();
        foreach (var job in jobs)
        {
            tasks.Add(context.CallSubOrchestratorAsync(nameof(DukascopySingleJobOrchestrator), job));
        }
        await Task.WhenAll(tasks);
    }

    [Function("DukascopySingleJobOrchestrator")]
    public async Task DukascopySingleJobOrchestrator([OrchestrationTrigger] TaskOrchestrationContext context)
    {
        var job = context.GetInput<DukascopyJobInput>();
        if (job == null)
        {
            return;
        }

        var executionId = Guid.NewGuid();
        await context.CallActivityAsync(nameof(DukascopyJobProcessStartActivity), new DukascopyJobStartInput(job.JobId, executionId));
        string? error = null;
        var success = true;
        try
        {
            var subOptions = TaskOptions.FromRetryPolicy(new RetryPolicy(2, TimeSpan.FromSeconds(5)));
            await context.CallSubOrchestratorAsync(nameof(DukascopyJobDayOrchestrator), new DukascopyJobExecutionInput(job.JobId, job.DataSourceId, job.Symbol, job.StartTime, executionId), subOptions);
        }
        catch (Exception ex)
        {
            success = false;
            error = ex.Message;
        }
        await context.CallActivityAsync(nameof(DukascopyJobProcessFinishActivity), new DukascopyJobFinishInput(job.JobId, executionId, success, error));
    }

    [Function("DukascopyJobDayOrchestrator")]
    public async Task DukascopyJobDayOrchestrator([OrchestrationTrigger] TaskOrchestrationContext context)
    {
        var job = context.GetInput<DukascopyJobExecutionInput>();
        if (job == null)
        {
            return;
        }

        var start = await context.CallActivityAsync<DateTimeOffset?>(nameof(DukascopyGetNextTimeActivity), job);
        if (start == null)
        {
            return;
        }

        var maxTime = context.CurrentUtcDateTime.AddHours(-1);
        var current = start.Value;
        if (current > maxTime)
        {
            current = job.StartTime > maxTime.AddDays(-1) ? job.StartTime : maxTime.AddDays(-1);
        }

        while (current <= maxTime)
        {
            var dayEnd = current.Date.AddDays(1);
            while (current < dayEnd && current <= maxTime)
            {
                var options = TaskOptions.FromRetryPolicy(new RetryPolicy(2, TimeSpan.FromSeconds(5)));
                await context.CallActivityAsync(nameof(DukascopyJobHourActivity), new DukascopyJobHourInput(job.JobId, job.DataSourceId, job.Symbol, current, job.ExecutionId), options);
                current = current.AddHours(1);
            }
        }
    }

    [Function("DukascopyGetNextTimeActivity")]
    public async Task<DateTimeOffset?> DukascopyGetNextTimeActivity([ActivityTrigger] DukascopyJobExecutionInput input, FunctionContext context)
    {
        var token = context.CancellationToken;
        var range = await _queryProcessor.ProcessAsync(new DataChunkRangeQuery(input.DataSourceId), token).ConfigureAwait(false);
        return range?.EndTime ?? input.StartTime;
    }

    [Function("DukascopyJobHourActivity")]
    public async Task DukascopyJobHourActivity([ActivityTrigger] DukascopyJobHourInput input, FunctionContext context)
    {
        var token = context.CancellationToken;
        _logger.LogInformation($"Fetching {input.Symbol} {input.Time}");
        await _fetchService.FetchHourAsync(input.JobId, input.DataSourceId, input.Symbol, input.Time, input.ExecutionId, token).ConfigureAwait(false);
    }

    [Function("DukascopyJobProcessStartActivity")]
    public async Task DukascopyJobProcessStartActivity([ActivityTrigger] DukascopyJobStartInput input, FunctionContext context)
    {
        await _commandBus.PublishAsync(new DukascopyJobExecutionStartCommand(DukascopyJobId.With(input.JobId))
        {
            ExecutionId = input.ExecutionId
        }, context.CancellationToken).ConfigureAwait(false);
    }

    [Function("DukascopyJobProcessFinishActivity")]
    public async Task DukascopyJobProcessFinishActivity([ActivityTrigger] DukascopyJobFinishInput input, FunctionContext context)
    {
        await _commandBus.PublishAsync(new DukascopyJobExecutionFinishCommand(DukascopyJobId.With(input.JobId))
        {
            ExecutionId = input.ExecutionId,
            IsSuccess = input.Success,
            ErrorMessage = input.Error
        }, context.CancellationToken).ConfigureAwait(false);
    }

    [Function("DukascopyJobTimer")]
    public async Task RunTimer([TimerTrigger("0 0 */12 * * *")] string timerInfo, [DurableClient] DurableTaskClient client, CancellationToken token)
    {
        _logger.LogInformation($"DukascopyJobTimer triggered at {DateTimeOffset.UtcNow}");
        var jobs = await _queryProcessor.ProcessAsync(new DukascopyJobReadModelSearchQuery(), token).ConfigureAwait(false);
        var targets = new List<DukascopyJobInput>();
        foreach (var j in jobs.Where(j => !j.IsDeleted))
        {
            if (!j.IsEnabled || j.IsRunning)
            {
                _logger.LogInformation($"Skip {j.Symbol} job");
                continue;
            }
            targets.Add(new DukascopyJobInput(j.JobId, j.DataSourceId, j.Symbol, j.StartTime));
        }
        if (targets.Count == 0)
        {
            _logger.LogInformation("No job to start");
            return;
        }

        await client.ScheduleNewOrchestrationInstanceAsync("DukascopyJobOrchestrator", targets, token);
    }
}


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
using Stratrack.Api.Domain.DataSources;
using EventFlow;
using EventFlow.Queries;

namespace Stratrack.Api.Functions;

public record DukascopyJobExecutionInput(Guid JobId, Guid DataSourceId, string Symbol, DateTimeOffset StartTime, Guid ExecutionId);
public record DukascopyJobDayInput(Guid JobId, Guid DataSourceId, string Symbol, DateTimeOffset Day, Guid ExecutionId);
public record DukascopyJobFinishInput(Guid JobId, Guid ExecutionId, bool Success, string? Error);
public record DukascopyJobInterruptInput(Guid JobId, Guid ExecutionId, string? Error);

public enum DukascopyJobDayResult
{
    Success,
    Interrupted,
    Failed
}

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

        var executionId = Guid.NewGuid();
        await _commandBus.PublishAsync(new DukascopyJobExecutionStartCommand(DukascopyJobId.With(id))
        {
            ExecutionId = executionId
        }, token).ConfigureAwait(false);

        await client.ScheduleNewOrchestrationInstanceAsync(
            "DukascopyJobOrchestrator",
            new DukascopyJobExecutionInput(job.JobId, job.DataSourceId, job.Symbol, job.StartTime, executionId),
            new StartOrchestrationOptions { InstanceId = executionId.ToString() },
            token);
        return req.CreateResponse(HttpStatusCode.Accepted);
    }

    [Function("RequestDukascopyJobInterrupt")]
    [OpenApiOperation(operationId: "request_dukascopy_job_interrupt", tags: ["DukascopyJob"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Accepted, Description = "Interrupt Requested")]
    public async Task<HttpResponseData> RequestInterrupt(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "dukascopy-job/{id:guid}/interrupt-request")] HttpRequestData req,
        Guid id,
        [DurableClient] DurableTaskClient client,
        CancellationToken token)
    {
        var jobs = await _queryProcessor.ProcessAsync(new DukascopyJobReadModelSearchQuery(), token).ConfigureAwait(false);
        var job = jobs.FirstOrDefault(j => j.JobId == id);
        if (job != null && job.CurrentExecutionId != null)
        {
            var instance = await client.GetInstanceAsync(job.CurrentExecutionId.Value.ToString(), token).ConfigureAwait(false);
            if (instance == null || instance.RuntimeStatus is OrchestrationRuntimeStatus.Completed or OrchestrationRuntimeStatus.Failed or OrchestrationRuntimeStatus.Canceled or OrchestrationRuntimeStatus.Terminated)
            {
                if (job.IsRunning)
                {
                    await _commandBus.PublishAsync(new DukascopyJobExecutionInterruptCommand(DukascopyJobId.With(id))
                    {
                        ExecutionId = job.CurrentExecutionId.Value,
                        ErrorMessage = "Interrupted"
                    }, token).ConfigureAwait(false);
                }
                return req.CreateResponse(HttpStatusCode.Accepted);
            }
        }

        await _commandBus.PublishAsync(new DukascopyJobExecutionInterruptRequestCommand(DukascopyJobId.With(id)), token).ConfigureAwait(false);
        return req.CreateResponse(HttpStatusCode.Accepted);
    }

    [Function("InterruptDukascopyJob")]
    [OpenApiOperation(operationId: "interrupt_dukascopy_job", tags: ["DukascopyJob"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Accepted, Description = "Interrupted")]
    public async Task<HttpResponseData> Interrupt(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "dukascopy-job/{id:guid}/interrupt")] HttpRequestData req,
        Guid id,
        [DurableClient] DurableTaskClient client,
        CancellationToken token)
    {
        var jobs = await _queryProcessor.ProcessAsync(new DukascopyJobReadModelSearchQuery(), token).ConfigureAwait(false);
        var job = jobs.FirstOrDefault(j => j.JobId == id);
        if (job == null || job.CurrentExecutionId == null)
        {
            return req.CreateResponse(HttpStatusCode.Accepted);
        }
        await client.TerminateInstanceAsync(job.CurrentExecutionId.Value.ToString(), "interrupt", token);
        await _commandBus.PublishAsync(new DukascopyJobExecutionInterruptCommand(DukascopyJobId.With(id))
        {
            ExecutionId = job.CurrentExecutionId.Value,
            ErrorMessage = "Interrupted"
        }, token).ConfigureAwait(false);
        return req.CreateResponse(HttpStatusCode.Accepted);
    }

    [Function("DukascopyJobOrchestrator")]
    public async Task DukascopyJobOrchestrator([OrchestrationTrigger] TaskOrchestrationContext context)
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

        var interrupted = false;
        string? error = null;
        try
        {
            while (current <= maxTime)
            {
                var result = await context.CallActivityAsync<DukascopyJobDayResult>(nameof(DukascopyJobDayActivity), new DukascopyJobDayInput(job.JobId, job.DataSourceId, job.Symbol, current.Date, job.ExecutionId));
                if (result == DukascopyJobDayResult.Interrupted)
                {
                    interrupted = true;
                    break;
                }
                if (result == DukascopyJobDayResult.Failed)
                {
                    error = "Failed";
                    break;
                }
                current = current.Date.AddDays(1);
            }
        }
        catch (Exception ex)
        {
            error = ex.Message;
        }

        if (interrupted)
        {
            await context.CallActivityAsync(nameof(DukascopyJobProcessInterruptActivity), new DukascopyJobInterruptInput(job.JobId, job.ExecutionId, "Interrupted"));
            return;
        }

        var success = error == null;
        await context.CallActivityAsync(nameof(DukascopyJobProcessFinishActivity), new DukascopyJobFinishInput(job.JobId, job.ExecutionId, success, error));
    }

    [Function("DukascopyGetNextTimeActivity")]
    public async Task<DateTimeOffset?> DukascopyGetNextTimeActivity([ActivityTrigger] DukascopyJobExecutionInput input, FunctionContext context)
    {
        var token = context.CancellationToken;
        var ds = await _queryProcessor
            .ProcessAsync(new ReadModelByIdQuery<DataSourceReadModel>(DataSourceId.With(input.DataSourceId)), token)
            .ConfigureAwait(false);
        return ds?.EndTime ?? input.StartTime;
    }

    [Function("DukascopyJobDayActivity")]
    public async Task<DukascopyJobDayResult> DukascopyJobDayActivity([ActivityTrigger] DukascopyJobDayInput input, FunctionContext context)
    {
        var token = context.CancellationToken;
        var jobs = await _queryProcessor.ProcessAsync(new DukascopyJobReadModelSearchQuery(), token).ConfigureAwait(false);
        var job = jobs.FirstOrDefault(j => j.JobId == input.JobId);
        if (job == null || job.InterruptRequested)
        {
            return DukascopyJobDayResult.Interrupted;
        }

        var current = input.Day;
        var end = input.Day.AddDays(1);
        try
        {
            while (current < end)
            {
                _logger.LogInformation($"Fetching {input.Symbol} {current}");
                await _fetchService.FetchHourAsync(input.JobId, input.DataSourceId, input.Symbol, current, input.ExecutionId, token).ConfigureAwait(false);

                jobs = await _queryProcessor.ProcessAsync(new DukascopyJobReadModelSearchQuery(), token).ConfigureAwait(false);
                job = jobs.FirstOrDefault(j => j.JobId == input.JobId);
                if (job?.InterruptRequested ?? false)
                {
                    return DukascopyJobDayResult.Interrupted;
                }
                current = current.AddHours(1);
            }

            return DukascopyJobDayResult.Success;
        }
        catch
        {
            return DukascopyJobDayResult.Failed;
        }
    }

    [Function("DukascopyJobProcessInterruptActivity")]
    public async Task DukascopyJobProcessInterruptActivity([ActivityTrigger] DukascopyJobInterruptInput input, FunctionContext context)
    {
        await _commandBus.PublishAsync(new DukascopyJobExecutionInterruptCommand(DukascopyJobId.With(input.JobId))
        {
            ExecutionId = input.ExecutionId,
            ErrorMessage = input.Error
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
        foreach (var j in jobs.Where(j => !j.IsDeleted))
        {
            if (!j.IsEnabled || j.IsRunning)
            {
                _logger.LogInformation($"Skip {j.Symbol} job");
                continue;
            }

            var executionId = Guid.NewGuid();
            await _commandBus.PublishAsync(new DukascopyJobExecutionStartCommand(DukascopyJobId.With(j.JobId))
            {
                ExecutionId = executionId
            }, token).ConfigureAwait(false);

            await client.ScheduleNewOrchestrationInstanceAsync(
                "DukascopyJobOrchestrator",
                new DukascopyJobExecutionInput(j.JobId, j.DataSourceId, j.Symbol, j.StartTime, executionId),
                new StartOrchestrationOptions { InstanceId = executionId.ToString() },
                token);
        }
    }
}


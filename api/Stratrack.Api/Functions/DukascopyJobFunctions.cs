using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Enums;
using Microsoft.OpenApi.Models;
using System.Net;
using Stratrack.Api.Domain.Dukascopy;
using Stratrack.Api.Domain.Dukascopy.Jobs;
using Stratrack.Api.Domain.Dukascopy.Jobs.Commands;
using EventFlow;
using EventFlow.Queries;

namespace Stratrack.Api.Functions;

public class DukascopyJobFunctions(ICommandBus commandBus, IQueryProcessor queryProcessor, DukascopyFetchService fetchService)
{
    private readonly ICommandBus _commandBus = commandBus;
    private readonly IQueryProcessor _queryProcessor = queryProcessor;
    private readonly DukascopyFetchService _fetchService = fetchService;
    private static readonly DukascopyJobId JobId = DukascopyJobId.With(Guid.Parse("11111111-1111-1111-1111-111111111111"));

    [Function("StartDukascopyJob")]
    [OpenApiOperation(operationId: "start_dukascopy_job", tags: ["DukascopyJob"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Accepted, Description = "Started")]
    public async Task<HttpResponseData> StartJob([HttpTrigger(AuthorizationLevel.Function, "post", Route = "dukascopy-job/start")] HttpRequestData req, CancellationToken token)
    {
        await _commandBus.PublishAsync(new DukascopyJobStartCommand(JobId), token).ConfigureAwait(false);
        var res = req.CreateResponse(HttpStatusCode.Accepted);
        return res;
    }

    [Function("StopDukascopyJob")]
    [OpenApiOperation(operationId: "stop_dukascopy_job", tags: ["DukascopyJob"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Accepted, Description = "Stopped")]
    public async Task<HttpResponseData> StopJob([HttpTrigger(AuthorizationLevel.Function, "post", Route = "dukascopy-job/stop")] HttpRequestData req, CancellationToken token)
    {
        await _commandBus.PublishAsync(new DukascopyJobStopCommand(JobId), token).ConfigureAwait(false);
        var res = req.CreateResponse(HttpStatusCode.Accepted);
        return res;
    }

    [Function("DukascopyJobTimer")]
    public async Task RunJob([TimerTrigger("0 0 */12 * * *")] string timerInfo, CancellationToken token)
    {
        var job = await _queryProcessor.ProcessAsync(new ReadModelByIdQuery<DukascopyJobReadModel>(JobId), token).ConfigureAwait(false);
        if (job?.IsRunning != true)
        {
            return;
        }

        await _fetchService.FetchAsync(token).ConfigureAwait(false);
    }
}


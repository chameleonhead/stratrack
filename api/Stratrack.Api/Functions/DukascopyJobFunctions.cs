using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Enums;
using Microsoft.OpenApi.Models;
using System.Net;
using Stratrack.Api.Domain.Dukascopy;

namespace Stratrack.Api.Functions;

public class DukascopyJobFunctions(IDukascopyJobControl control)
{
    private readonly IDukascopyJobControl _control = control;

    [Function("StartDukascopyJob")]
    [OpenApiOperation(operationId: "start_dukascopy_job", tags: ["DukascopyJob"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Accepted, Description = "Started")]
    public Task<HttpResponseData> StartJob([HttpTrigger(AuthorizationLevel.Function, "post", Route = "dukascopy-job/start")] HttpRequestData req)
    {
        _control.Start();
        var res = req.CreateResponse(HttpStatusCode.Accepted);
        return Task.FromResult(res);
    }

    [Function("StopDukascopyJob")]
    [OpenApiOperation(operationId: "stop_dukascopy_job", tags: ["DukascopyJob"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Accepted, Description = "Stopped")]
    public Task<HttpResponseData> StopJob([HttpTrigger(AuthorizationLevel.Function, "post", Route = "dukascopy-job/stop")] HttpRequestData req)
    {
        _control.Stop();
        var res = req.CreateResponse(HttpStatusCode.Accepted);
        return Task.FromResult(res);
    }
}


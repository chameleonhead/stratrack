using EventFlow.EntityFramework;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using System.Net;
using Stratrack.Api.Infrastructure;

namespace Stratrack.Api.Functions;

public class MaintenanceFunctions(StratrackDbContextProvider dbContextProvider)
{
    [Function("ResetDatabase")]
    [OpenApiOperation(operationId: "reset_database", tags: ["Maintenance"])]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, In = OpenApiSecurityLocationType.Header, Name = "x-functions-key")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NoContent, Description = "No content")]
    public async Task<HttpResponseData> ResetDatabase([
        HttpTrigger(AuthorizationLevel.Function, "post", Route = "maintenance/reset")]
        HttpRequestData req,
        CancellationToken token)
    {
        using var context = dbContextProvider.CreateContextWithoutInitialization();
        await context.Database.EnsureDeletedAsync(token).ConfigureAwait(false);
        if (context.Database.IsSqlServer())
        {
            await context.Database.MigrateAsync(token).ConfigureAwait(false);
        }
        else
        {
            await context.Database.EnsureCreatedAsync(token).ConfigureAwait(false);
        }
        return req.CreateResponse(HttpStatusCode.NoContent);
    }
}

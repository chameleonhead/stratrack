using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using Stratrack.Api.Domain.Dukascopy;
using System.Threading.Tasks;

namespace Stratrack.Api.Functions;

public class DukascopyJobActivity(DukascopyFetchService fetchService, ILogger<DukascopyJobActivity> logger)
{
    private readonly DukascopyFetchService _fetchService = fetchService;
    private readonly ILogger<DukascopyJobActivity> _logger = logger;

    [Function(nameof(DukascopyJobActivity))]
    public async Task Run([ActivityTrigger] DukascopyJobInput input, FunctionContext context)
    {
        var token = context.CancellationToken;
        _logger.LogInformation("Processing job {JobId}", input.JobId);
        await _fetchService.FetchAsync(input.JobId, input.DataSourceId, input.Symbol, input.StartTime, token).ConfigureAwait(false);
    }
}

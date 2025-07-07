using Microsoft.Azure.Functions.Worker;
using Microsoft.DurableTask.Client;
using Microsoft.Extensions.Logging;
using Stratrack.Api.Domain.Dukascopy.Queries;
using EventFlow.Queries;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Stratrack.Api.Functions;

public class DukascopyJobTimer(IQueryProcessor queryProcessor, ILogger<DukascopyJobTimer> logger)
{
    private readonly IQueryProcessor _queryProcessor = queryProcessor;
    private readonly ILogger<DukascopyJobTimer> _logger = logger;

    [Function("DukascopyJobTimer")]
    public async Task RunAsync([TimerTrigger("0 0 */12 * * *")] string timerInfo, [DurableClient] DurableTaskClient client, CancellationToken token)
    {
        _logger.LogInformation("DukascopyJobTimer triggered at {Time}", DateTimeOffset.UtcNow);
        var jobs = await _queryProcessor.ProcessAsync(new DukascopyJobReadModelSearchQuery(), token).ConfigureAwait(false);
        var targets = jobs
            .Where(j => !j.IsDeleted && j.IsRunning)
            .Select(j => new DukascopyJobInput(j.JobId, j.DataSourceId, j.Symbol, j.StartTime))
            .ToList();
        if (targets.Count == 0)
        {
            _logger.LogInformation("No running jobs found");
            return;
        }

        await client.ScheduleNewOrchestrationInstanceAsync(nameof(DukascopyJobOrchestrator), targets, token);
    }
}

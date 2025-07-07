using Microsoft.Azure.Functions.Worker;
using Microsoft.DurableTask;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Stratrack.Api.Functions;

public record DukascopyJobInput(Guid JobId, Guid DataSourceId, string Symbol, DateTimeOffset StartTime);

public class DukascopyJobOrchestrator
{
    [Function(nameof(DukascopyJobOrchestrator))]
    public async Task Run([OrchestrationTrigger] TaskOrchestrationContext context)
    {
        var jobs = context.GetInput<IReadOnlyList<DukascopyJobInput>>();
        if (jobs == null || jobs.Count == 0)
        {
            return;
        }

        var tasks = new List<Task>();
        foreach (var job in jobs)
        {
            tasks.Add(context.CallActivityAsync(nameof(DukascopyJobActivity), job));
        }

        await Task.WhenAll(tasks);
    }
}

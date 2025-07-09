using EventFlow.Aggregates;
using EventFlow.ReadStores;
using Stratrack.Api.Domain.Dukascopy.Events;

namespace Stratrack.Api.Domain.Dukascopy;

public class DukascopyJobStepReadModelLocator : IReadModelLocator
{
    public IEnumerable<string> GetReadModelIds(IDomainEvent domainEvent)
    {
        return domainEvent switch
        {
            IDomainEvent<DukascopyJobAggregate, DukascopyJobId, DukascopyJobExecutedEvent> e =>
                ["" + e.AggregateEvent.ExecutionId + "_" + e.AggregateEvent.TargetTime.ToString("yyyyMMddHHmmss")],
            _ => []
        };
    }
}

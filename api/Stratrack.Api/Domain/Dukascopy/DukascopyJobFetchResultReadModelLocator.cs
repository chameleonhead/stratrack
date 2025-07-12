using EventFlow.Aggregates;
using EventFlow.ReadStores;
using Stratrack.Api.Domain.Dukascopy.Events;

namespace Stratrack.Api.Domain.Dukascopy;

public class DukascopyJobFetchResultReadModelLocator : IReadModelLocator
{
    public IEnumerable<string> GetReadModelIds(IDomainEvent domainEvent)
    {
        return domainEvent switch
        {
            IDomainEvent<DukascopyJobAggregate, DukascopyJobId, DukascopyJobExecutedEvent> e =>
                ["" + e.AggregateIdentity.GetGuid() + "_" + e.AggregateEvent.FileUrl],
            _ => []
        };
    }
}

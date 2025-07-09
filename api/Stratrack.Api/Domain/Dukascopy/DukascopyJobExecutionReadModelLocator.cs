using EventFlow.Aggregates;
using EventFlow.ReadStores;
using Stratrack.Api.Domain.Dukascopy.Events;

namespace Stratrack.Api.Domain.Dukascopy;

public class DukascopyJobExecutionReadModelLocator : IReadModelLocator
{
    public IEnumerable<string> GetReadModelIds(IDomainEvent domainEvent)
    {
        return domainEvent switch
        {
            IDomainEvent<DukascopyJobAggregate, DukascopyJobId, DukascopyJobExecutionStartedEvent> e =>
                [e.AggregateEvent.ExecutionId.ToString()],
            IDomainEvent<DukascopyJobAggregate, DukascopyJobId, DukascopyJobExecutionFinishedEvent> e =>
                [e.AggregateEvent.ExecutionId.ToString()],
            _ => []
        };
    }
}

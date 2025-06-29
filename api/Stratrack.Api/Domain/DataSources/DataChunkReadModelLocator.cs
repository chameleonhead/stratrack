using EventFlow.Aggregates;
using EventFlow.ReadStores;
using Stratrack.Api.Domain.DataSources.Events;

namespace Stratrack.Api.Domain.DataSources;

public class DataChunkReadModelLocator : IReadModelLocator
{
    public IEnumerable<string> GetReadModelIds(IDomainEvent domainEvent)
    {
        return domainEvent switch
        {
            IDomainEvent<DataSourceAggregate, DataSourceId, DataChunkRegisteredEvent> registered =>
                ["" + registered.AggregateIdentity.GetGuid() + "_" + registered.AggregateEvent.ChunkId],
            IDomainEvent<DataSourceAggregate, DataSourceId, DataChunkDeletedEvent> deleted =>
                ["" + deleted.AggregateIdentity.GetGuid() + "_" + deleted.AggregateEvent.ChunkId],
            _ => []
        };
    }
}

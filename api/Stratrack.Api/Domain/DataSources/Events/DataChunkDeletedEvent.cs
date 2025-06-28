using EventFlow.Aggregates;
using EventFlow.EventStores;

namespace Stratrack.Api.Domain.DataSources.Events;

[EventVersion("DataChunkDeleted", 1)]
public class DataChunkDeletedEvent(Guid chunkId) : AggregateEvent<DataSourceAggregate, DataSourceId>
{
    public Guid ChunkId { get; } = chunkId;
}

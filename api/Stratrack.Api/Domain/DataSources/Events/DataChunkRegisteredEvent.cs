using EventFlow.Aggregates;
using EventFlow.EventStores;

namespace Stratrack.Api.Domain.DataSources.Events;

[EventVersion("DataChunkRegistered", 1)]
public class DataChunkRegisteredEvent(
    Guid chunkId,
    Guid blobId,
    DateTimeOffset startTime,
    DateTimeOffset endTime) : AggregateEvent<DataSourceAggregate, DataSourceId>
{
    public Guid ChunkId { get; } = chunkId;
    public Guid BlobId { get; } = blobId;
    public DateTimeOffset StartTime { get; } = startTime;
    public DateTimeOffset EndTime { get; } = endTime;
}

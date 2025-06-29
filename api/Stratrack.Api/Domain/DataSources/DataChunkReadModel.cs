using EventFlow.Aggregates;
using EventFlow.ReadStores;
using Stratrack.Api.Domain.DataSources.Events;
using System.ComponentModel.DataAnnotations;

namespace Stratrack.Api.Domain.DataSources;

public class DataChunkReadModel : IReadModel,
    IAmReadModelFor<DataSourceAggregate, DataSourceId, DataChunkRegisteredEvent>,
    IAmReadModelFor<DataSourceAggregate, DataSourceId, DataChunkDeletedEvent>
{
    [Key]
    public string Id { get; set; } = "";
    public Guid DataChunkId { get; set; }
    public Guid DataSourceId { get; set; }
    public Guid BlobId { get; set; }
    public DateTimeOffset StartTime { get; set; }
    public DateTimeOffset EndTime { get; set; }

    public Task ApplyAsync(IReadModelContext context, IDomainEvent<DataSourceAggregate, DataSourceId, DataChunkRegisteredEvent> domainEvent, CancellationToken cancellationToken)
    {
        var e = domainEvent.AggregateEvent;
        Id = context.ReadModelId;
        DataChunkId = e.ChunkId;
        DataSourceId = domainEvent.AggregateIdentity.GetGuid();
        BlobId = e.BlobId;
        StartTime = e.StartTime;
        EndTime = e.EndTime;
        return Task.CompletedTask;
    }

    public Task ApplyAsync(IReadModelContext context, IDomainEvent<DataSourceAggregate, DataSourceId, DataChunkDeletedEvent> domainEvent, CancellationToken cancellationToken)
    {
        context.MarkForDeletion();
        return Task.CompletedTask;
    }
}

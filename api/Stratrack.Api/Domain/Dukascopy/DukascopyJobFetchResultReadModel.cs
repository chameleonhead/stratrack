using EventFlow.Aggregates;
using EventFlow.ReadStores;
using Stratrack.Api.Domain.Dukascopy.Events;

namespace Stratrack.Api.Domain.Dukascopy;

public class DukascopyJobFetchResultReadModel : IReadModel,
    IAmReadModelFor<DukascopyJobAggregate, DukascopyJobId, DukascopyJobExecutedEvent>
{
    public string Id { get; set; } = string.Empty;
    public Guid JobId { get; set; }
    public string FileUrl { get; set; } = string.Empty;
    public int HttpStatus { get; set; }
    public string? ETag { get; set; }
    public DateTimeOffset? LastModified { get; set; }

    public Task ApplyAsync(IReadModelContext context, IDomainEvent<DukascopyJobAggregate, DukascopyJobId, DukascopyJobExecutedEvent> domainEvent, CancellationToken cancellationToken)
    {
        Id = context.ReadModelId;
        JobId = domainEvent.AggregateIdentity.GetGuid();
        FileUrl = domainEvent.AggregateEvent.FileUrl;
        HttpStatus = domainEvent.AggregateEvent.HttpStatus;
        ETag = domainEvent.AggregateEvent.ETag;
        LastModified = domainEvent.AggregateEvent.LastModified;
        return Task.CompletedTask;
    }
}

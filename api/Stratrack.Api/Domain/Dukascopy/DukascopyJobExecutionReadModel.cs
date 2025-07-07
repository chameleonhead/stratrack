using EventFlow.Aggregates;
using EventFlow.ReadStores;
using Stratrack.Api.Domain.Dukascopy.Events;
using System.ComponentModel.DataAnnotations;

namespace Stratrack.Api.Domain.Dukascopy;

public class DukascopyJobExecutionReadModel : IReadModel,
    IAmReadModelFor<DukascopyJobAggregate, DukascopyJobId, DukascopyJobExecutedEvent>
{
    [Key]
    public string Id { get; set; } = "";
    public Guid JobId { get; set; }
    public DateTimeOffset ExecutedAt { get; set; }
    public bool IsSuccess { get; set; }

    public Task ApplyAsync(IReadModelContext context, IDomainEvent<DukascopyJobAggregate, DukascopyJobId, DukascopyJobExecutedEvent> domainEvent, CancellationToken cancellationToken)
    {
        Id = context.ReadModelId;
        JobId = domainEvent.AggregateIdentity.GetGuid();
        ExecutedAt = domainEvent.AggregateEvent.ExecutedAt;
        IsSuccess = domainEvent.AggregateEvent.IsSuccess;
        return Task.CompletedTask;
    }
}

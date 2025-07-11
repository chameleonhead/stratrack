using EventFlow.Aggregates;
using EventFlow.ReadStores;
using Stratrack.Api.Domain.Dukascopy.Events;
using System.ComponentModel.DataAnnotations;

namespace Stratrack.Api.Domain.Dukascopy;

public class DukascopyJobExecutionReadModel : IReadModel,
    IAmReadModelFor<DukascopyJobAggregate, DukascopyJobId, DukascopyJobExecutionStartedEvent>,
    IAmReadModelFor<DukascopyJobAggregate, DukascopyJobId, DukascopyJobExecutionFinishedEvent>,
    IAmReadModelFor<DukascopyJobAggregate, DukascopyJobId, DukascopyJobExecutionInterruptedEvent>
{
[Key]
public string Id { get; set; } = string.Empty;
public Guid ExecutionId { get; set; }
    public Guid JobId { get; set; }
    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset? FinishedAt { get; set; }
    public bool? IsSuccess { get; set; }
    public string? ErrorMessage { get; set; }

    public Task ApplyAsync(IReadModelContext context, IDomainEvent<DukascopyJobAggregate, DukascopyJobId, DukascopyJobExecutionStartedEvent> domainEvent, CancellationToken cancellationToken)
    {
        Id = context.ReadModelId;
        ExecutionId = domainEvent.AggregateEvent.ExecutionId;
        JobId = domainEvent.AggregateIdentity.GetGuid();
        StartedAt = domainEvent.AggregateEvent.StartedAt;
        return Task.CompletedTask;
    }

    public Task ApplyAsync(IReadModelContext context, IDomainEvent<DukascopyJobAggregate, DukascopyJobId, DukascopyJobExecutionFinishedEvent> domainEvent, CancellationToken cancellationToken)
    {
        Id = context.ReadModelId;
        ExecutionId = domainEvent.AggregateEvent.ExecutionId;
        JobId = domainEvent.AggregateIdentity.GetGuid();
        FinishedAt = domainEvent.AggregateEvent.FinishedAt;
        IsSuccess = domainEvent.AggregateEvent.IsSuccess;
        ErrorMessage = domainEvent.AggregateEvent.ErrorMessage;
        return Task.CompletedTask;
    }

    public Task ApplyAsync(IReadModelContext context, IDomainEvent<DukascopyJobAggregate, DukascopyJobId, DukascopyJobExecutionInterruptedEvent> domainEvent, CancellationToken cancellationToken)
    {
        Id = context.ReadModelId;
        ExecutionId = domainEvent.AggregateEvent.ExecutionId;
        JobId = domainEvent.AggregateIdentity.GetGuid();
        FinishedAt = domainEvent.Timestamp;
        IsSuccess = false;
        ErrorMessage = domainEvent.AggregateEvent.ErrorMessage;
        return Task.CompletedTask;
    }
}

using EventFlow.Aggregates;
using EventFlow.ReadStores;
using Stratrack.Api.Domain.Dukascopy.Events;
using System.ComponentModel.DataAnnotations;

namespace Stratrack.Api.Domain.Dukascopy;

public class DukascopyJobStepReadModel : IReadModel,
    IAmReadModelFor<DukascopyJobAggregate, DukascopyJobId, DukascopyJobExecutedEvent>
{
    [Key]
    public string Id { get; set; } = string.Empty;
    public Guid ExecutionId { get; set; }
    public Guid JobId { get; set; }
    public DateTimeOffset ExecutedAt { get; set; }
    public bool IsSuccess { get; set; }
    public string Symbol { get; set; } = string.Empty;
    public DateTimeOffset TargetTime { get; set; }
    public string? ErrorMessage { get; set; }
    public double Duration { get; set; }

    public Task ApplyAsync(IReadModelContext context, IDomainEvent<DukascopyJobAggregate, DukascopyJobId, DukascopyJobExecutedEvent> domainEvent, CancellationToken cancellationToken)
    {
        Id = context.ReadModelId;
        ExecutionId = domainEvent.AggregateEvent.ExecutionId;
        JobId = domainEvent.AggregateIdentity.GetGuid();
        ExecutedAt = domainEvent.AggregateEvent.ExecutedAt;
        IsSuccess = domainEvent.AggregateEvent.IsSuccess;
        Symbol = domainEvent.AggregateEvent.Symbol;
        TargetTime = domainEvent.AggregateEvent.TargetTime;
        ErrorMessage = domainEvent.AggregateEvent.ErrorMessage;
        Duration = domainEvent.AggregateEvent.Duration;
        return Task.CompletedTask;
    }
}

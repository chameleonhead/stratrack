using EventFlow.Aggregates;
using EventFlow.ReadStores;
using Stratrack.Api.Domain.Dukascopy.Events;
using System.ComponentModel.DataAnnotations;

namespace Stratrack.Api.Domain.Dukascopy;

public class DukascopyJobExecutionReadModel : IReadModel,
    IAmReadModelFor<DukascopyJobAggregate, DukascopyJobId, DukascopyJobExecutedEvent>,
    IAmReadModelFor<DukascopyJobAggregate, DukascopyJobId, DukascopyJobSkippedEvent>
{
    [Key]
    public string Id { get; set; } = "";
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
        JobId = domainEvent.AggregateIdentity.GetGuid();
        ExecutedAt = domainEvent.AggregateEvent.ExecutedAt;
        IsSuccess = domainEvent.AggregateEvent.IsSuccess;
        Symbol = domainEvent.AggregateEvent.Symbol;
        TargetTime = domainEvent.AggregateEvent.TargetTime;
        ErrorMessage = domainEvent.AggregateEvent.ErrorMessage;
        Duration = domainEvent.AggregateEvent.Duration;
        return Task.CompletedTask;
    }

    public Task ApplyAsync(IReadModelContext context, IDomainEvent<DukascopyJobAggregate, DukascopyJobId, DukascopyJobSkippedEvent> domainEvent, CancellationToken cancellationToken)
    {
        Id = context.ReadModelId;
        JobId = domainEvent.AggregateIdentity.GetGuid();
        ExecutedAt = domainEvent.AggregateEvent.ExecutedAt;
        IsSuccess = false;
        Symbol = domainEvent.AggregateEvent.Symbol;
        TargetTime = domainEvent.AggregateEvent.ExecutedAt;
        ErrorMessage = domainEvent.AggregateEvent.Reason;
        Duration = 0;
        return Task.CompletedTask;
    }
}

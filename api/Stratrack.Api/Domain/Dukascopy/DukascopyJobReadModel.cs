using EventFlow.Aggregates;
using EventFlow.ReadStores;
using Stratrack.Api.Domain.Dukascopy.Events;

namespace Stratrack.Api.Domain.Dukascopy;

public class DukascopyJobReadModel : IReadModel,
    IAmReadModelFor<DukascopyJobAggregate, DukascopyJobId, DukascopyJobCreatedEvent>,
    IAmReadModelFor<DukascopyJobAggregate, DukascopyJobId, DukascopyJobUpdatedEvent>,
    IAmReadModelFor<DukascopyJobAggregate, DukascopyJobId, DukascopyJobEnabledEvent>,
    IAmReadModelFor<DukascopyJobAggregate, DukascopyJobId, DukascopyJobDisabledEvent>,
    IAmReadModelFor<DukascopyJobAggregate, DukascopyJobId, DukascopyJobDeletedEvent>,
    IAmReadModelFor<DukascopyJobAggregate, DukascopyJobId, DukascopyJobExecutionStartedEvent>,
    IAmReadModelFor<DukascopyJobAggregate, DukascopyJobId, DukascopyJobExecutionFinishedEvent>,
    IAmReadModelFor<DukascopyJobAggregate, DukascopyJobId, DukascopyJobExecutionInterruptRequestedEvent>,
    IAmReadModelFor<DukascopyJobAggregate, DukascopyJobId, DukascopyJobExecutionInterruptedEvent>
{
    public string Id { get; set; } = "";
    public Guid JobId { get; set; }
    public Guid DataSourceId { get; set; }
    public string Symbol { get; set; } = "";
    public DateTimeOffset StartTime { get; set; }
    public bool IsDeleted { get; set; }
    public bool IsEnabled { get; set; }
    public bool IsRunning { get; set; }
    public Guid? CurrentExecutionId { get; set; }
    public DateTimeOffset? LastExecutionStartedAt { get; set; }
    public DateTimeOffset? LastExecutionFinishedAt { get; set; }
    public bool? LastExecutionSucceeded { get; set; }
    public string? LastExecutionError { get; set; }
    public bool InterruptRequested { get; set; }
    public DateTimeOffset UpdatedAt { get; private set; }

    public Task ApplyAsync(IReadModelContext context, IDomainEvent<DukascopyJobAggregate, DukascopyJobId, DukascopyJobCreatedEvent> domainEvent, CancellationToken cancellationToken)
    {
        Id = context.ReadModelId;
        JobId = domainEvent.AggregateIdentity.GetGuid();
        Symbol = domainEvent.AggregateEvent.Symbol;
        StartTime = domainEvent.AggregateEvent.StartTime;
        DataSourceId = Guid.Empty;
        IsDeleted = false;
        IsEnabled = false;
        UpdatedAt = domainEvent.Timestamp;
        return Task.CompletedTask;
    }

    public Task ApplyAsync(IReadModelContext context, IDomainEvent<DukascopyJobAggregate, DukascopyJobId, DukascopyJobUpdatedEvent> domainEvent, CancellationToken cancellationToken)
    {
        Id = context.ReadModelId;
        JobId = domainEvent.AggregateIdentity.GetGuid();
        DataSourceId = domainEvent.AggregateEvent.DataSourceId;
        StartTime = domainEvent.AggregateEvent.StartTime;
        UpdatedAt = domainEvent.Timestamp;
        return Task.CompletedTask;
    }

    public Task ApplyAsync(IReadModelContext context, IDomainEvent<DukascopyJobAggregate, DukascopyJobId, DukascopyJobEnabledEvent> domainEvent, CancellationToken cancellationToken)
    {
        Id = context.ReadModelId;
        JobId = domainEvent.AggregateIdentity.GetGuid();
        IsEnabled = true;
        UpdatedAt = domainEvent.Timestamp;
        return Task.CompletedTask;
    }

    public Task ApplyAsync(IReadModelContext context, IDomainEvent<DukascopyJobAggregate, DukascopyJobId, DukascopyJobDisabledEvent> domainEvent, CancellationToken cancellationToken)
    {
        Id = context.ReadModelId;
        JobId = domainEvent.AggregateIdentity.GetGuid();
        IsEnabled = false;
        UpdatedAt = domainEvent.Timestamp;
        return Task.CompletedTask;
    }

    public Task ApplyAsync(IReadModelContext context, IDomainEvent<DukascopyJobAggregate, DukascopyJobId, DukascopyJobDeletedEvent> domainEvent, CancellationToken cancellationToken)
    {
        Id = context.ReadModelId;
        JobId = domainEvent.AggregateIdentity.GetGuid();
        IsDeleted = true;
        UpdatedAt = domainEvent.Timestamp;
        return Task.CompletedTask;
    }

    public Task ApplyAsync(IReadModelContext context, IDomainEvent<DukascopyJobAggregate, DukascopyJobId, DukascopyJobExecutionStartedEvent> domainEvent, CancellationToken cancellationToken)
    {
        Id = context.ReadModelId;
        JobId = domainEvent.AggregateIdentity.GetGuid();
        IsRunning = true;
        CurrentExecutionId = domainEvent.AggregateEvent.ExecutionId;
        LastExecutionStartedAt = domainEvent.AggregateEvent.StartedAt;
        UpdatedAt = domainEvent.Timestamp;
        return Task.CompletedTask;
    }

    public Task ApplyAsync(IReadModelContext context, IDomainEvent<DukascopyJobAggregate, DukascopyJobId, DukascopyJobExecutionFinishedEvent> domainEvent, CancellationToken cancellationToken)
    {
        Id = context.ReadModelId;
        JobId = domainEvent.AggregateIdentity.GetGuid();
        IsRunning = false;
        CurrentExecutionId = null;
        LastExecutionFinishedAt = domainEvent.AggregateEvent.FinishedAt;
        LastExecutionSucceeded = domainEvent.AggregateEvent.IsSuccess;
        LastExecutionError = domainEvent.AggregateEvent.ErrorMessage;
        UpdatedAt = domainEvent.Timestamp;
        return Task.CompletedTask;
    }

    public Task ApplyAsync(IReadModelContext context, IDomainEvent<DukascopyJobAggregate, DukascopyJobId, DukascopyJobExecutionInterruptRequestedEvent> domainEvent, CancellationToken cancellationToken)
    {
        Id = context.ReadModelId;
        JobId = domainEvent.AggregateIdentity.GetGuid();
        InterruptRequested = true;
        UpdatedAt = domainEvent.Timestamp;
        return Task.CompletedTask;
    }

    public Task ApplyAsync(IReadModelContext context, IDomainEvent<DukascopyJobAggregate, DukascopyJobId, DukascopyJobExecutionInterruptedEvent> domainEvent, CancellationToken cancellationToken)
    {
        Id = context.ReadModelId;
        JobId = domainEvent.AggregateIdentity.GetGuid();
        IsRunning = false;
        InterruptRequested = false;
        CurrentExecutionId = null;
        LastExecutionFinishedAt = domainEvent.Timestamp;
        LastExecutionSucceeded = false;
        LastExecutionError = domainEvent.AggregateEvent.ErrorMessage;
        UpdatedAt = domainEvent.Timestamp;
        return Task.CompletedTask;
    }
}

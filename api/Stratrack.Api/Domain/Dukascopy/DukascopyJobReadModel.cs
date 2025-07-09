using EventFlow.Aggregates;
using EventFlow.ReadStores;
using Stratrack.Api.Domain.Dukascopy.Events;

namespace Stratrack.Api.Domain.Dukascopy;

public class DukascopyJobReadModel : IReadModel,
    IAmReadModelFor<DukascopyJobAggregate, DukascopyJobId, DukascopyJobCreatedEvent>,
    IAmReadModelFor<DukascopyJobAggregate, DukascopyJobId, DukascopyJobUpdatedEvent>,
    IAmReadModelFor<DukascopyJobAggregate, DukascopyJobId, DukascopyJobStartedEvent>,
    IAmReadModelFor<DukascopyJobAggregate, DukascopyJobId, DukascopyJobStoppedEvent>,
    IAmReadModelFor<DukascopyJobAggregate, DukascopyJobId, DukascopyJobDeletedEvent>,
    IAmReadModelFor<DukascopyJobAggregate, DukascopyJobId, DukascopyJobProcessStartedEvent>,
    IAmReadModelFor<DukascopyJobAggregate, DukascopyJobId, DukascopyJobProcessFinishedEvent>
{
    public string Id { get; set; } = "";
    public Guid JobId { get; set; }
    public Guid DataSourceId { get; set; }
    public string Symbol { get; set; } = "";
    public DateTimeOffset StartTime { get; set; }
    public bool IsDeleted { get; set; }
    public bool IsRunning { get; set; }
    public bool IsProcessing { get; set; }
    public DateTimeOffset? LastProcessStartedAt { get; set; }
    public DateTimeOffset? LastProcessFinishedAt { get; set; }
    public bool? LastProcessSucceeded { get; set; }
    public string? LastProcessError { get; set; }
    public DateTimeOffset UpdatedAt { get; private set; }

    public Task ApplyAsync(IReadModelContext context, IDomainEvent<DukascopyJobAggregate, DukascopyJobId, DukascopyJobCreatedEvent> domainEvent, CancellationToken cancellationToken)
    {
        Id = context.ReadModelId;
        JobId = domainEvent.AggregateIdentity.GetGuid();
        Symbol = domainEvent.AggregateEvent.Symbol;
        StartTime = domainEvent.AggregateEvent.StartTime;
        DataSourceId = Guid.Empty;
        IsDeleted = false;
        IsRunning = false;
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

    public Task ApplyAsync(IReadModelContext context, IDomainEvent<DukascopyJobAggregate, DukascopyJobId, DukascopyJobStartedEvent> domainEvent, CancellationToken cancellationToken)
    {
        Id = context.ReadModelId;
        JobId = domainEvent.AggregateIdentity.GetGuid();
        IsRunning = true;
        UpdatedAt = domainEvent.Timestamp;
        return Task.CompletedTask;
    }

    public Task ApplyAsync(IReadModelContext context, IDomainEvent<DukascopyJobAggregate, DukascopyJobId, DukascopyJobStoppedEvent> domainEvent, CancellationToken cancellationToken)
    {
        Id = context.ReadModelId;
        JobId = domainEvent.AggregateIdentity.GetGuid();
        IsRunning = false;
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

    public Task ApplyAsync(IReadModelContext context, IDomainEvent<DukascopyJobAggregate, DukascopyJobId, DukascopyJobProcessStartedEvent> domainEvent, CancellationToken cancellationToken)
    {
        Id = context.ReadModelId;
        JobId = domainEvent.AggregateIdentity.GetGuid();
        IsProcessing = true;
        LastProcessStartedAt = domainEvent.AggregateEvent.StartedAt;
        UpdatedAt = domainEvent.Timestamp;
        return Task.CompletedTask;
    }

    public Task ApplyAsync(IReadModelContext context, IDomainEvent<DukascopyJobAggregate, DukascopyJobId, DukascopyJobProcessFinishedEvent> domainEvent, CancellationToken cancellationToken)
    {
        Id = context.ReadModelId;
        JobId = domainEvent.AggregateIdentity.GetGuid();
        IsProcessing = false;
        LastProcessFinishedAt = domainEvent.AggregateEvent.FinishedAt;
        LastProcessSucceeded = domainEvent.AggregateEvent.IsSuccess;
        LastProcessError = domainEvent.AggregateEvent.ErrorMessage;
        UpdatedAt = domainEvent.Timestamp;
        return Task.CompletedTask;
    }
}

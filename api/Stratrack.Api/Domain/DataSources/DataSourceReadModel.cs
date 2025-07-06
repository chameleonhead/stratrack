using EventFlow.Aggregates;
using EventFlow.ReadStores;
using Stratrack.Api.Domain.DataSources.Events;
using System.Linq;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Stratrack.Api.Domain.DataSources;

public class DataSourceReadModel : IReadModel,
    IAmReadModelFor<DataSourceAggregate, DataSourceId, DataSourceCreatedEvent>,
    IAmReadModelFor<DataSourceAggregate, DataSourceId, DataSourceUpdatedEvent>,
    IAmReadModelFor<DataSourceAggregate, DataSourceId, DataSourceDeletedEvent>,
    IAmReadModelFor<DataSourceAggregate, DataSourceId, DataSourceLockedEvent>,
    IAmReadModelFor<DataSourceAggregate, DataSourceId, DataSourceUnlockedEvent>
{
    public string Id { get; set; } = "";
    public Guid DataSourceId { get; set; } = Guid.Empty;
    public string Name { get; set; } = "";
    public string Symbol { get; set; } = "";
    public string Timeframe { get; set; } = "";
    public string Fields { get; set; } = "";
    public DataFormat Format { get; set; } = DataFormat.Tick;
    public VolumeType Volume { get; set; } = VolumeType.None;
    public string? Description { get; set; }
    public bool IsLocked { get; set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }

    public Task ApplyAsync(IReadModelContext context, IDomainEvent<DataSourceAggregate, DataSourceId, DataSourceCreatedEvent> domainEvent, CancellationToken cancellationToken)
    {
        var dataSourceCreatedEvent = domainEvent.AggregateEvent;
        Id = context.ReadModelId;
        DataSourceId = domainEvent.AggregateIdentity.GetGuid();
        Name = dataSourceCreatedEvent.Name;
        Symbol = dataSourceCreatedEvent.Symbol;
        Timeframe = dataSourceCreatedEvent.Timeframe;
        Fields = string.Join(',', dataSourceCreatedEvent.Fields);
        Format = dataSourceCreatedEvent.Format;
        Volume = dataSourceCreatedEvent.Volume;
        Description = dataSourceCreatedEvent.Description;
        IsLocked = false;
        CreatedAt = domainEvent.Timestamp;
        UpdatedAt = domainEvent.Timestamp;
        return Task.CompletedTask;
    }

    public Task ApplyAsync(IReadModelContext context, IDomainEvent<DataSourceAggregate, DataSourceId, DataSourceUpdatedEvent> domainEvent, CancellationToken cancellationToken)
    {
        var dataSourceCreatedEvent = domainEvent.AggregateEvent;
        Id = context.ReadModelId;
        DataSourceId = domainEvent.AggregateIdentity.GetGuid();
        Name = dataSourceCreatedEvent.Name;
        Description = dataSourceCreatedEvent.Description;
        UpdatedAt = domainEvent.Timestamp;
        return Task.CompletedTask;
    }

    public Task ApplyAsync(IReadModelContext context, IDomainEvent<DataSourceAggregate, DataSourceId, DataSourceDeletedEvent> domainEvent, CancellationToken cancellationToken)
    {
        context.MarkForDeletion();
        return Task.CompletedTask;
    }

    public Task ApplyAsync(IReadModelContext context, IDomainEvent<DataSourceAggregate, DataSourceId, DataSourceLockedEvent> domainEvent, CancellationToken cancellationToken)
    {
        Id = context.ReadModelId;
        DataSourceId = domainEvent.AggregateIdentity.GetGuid();
        IsLocked = true;
        UpdatedAt = domainEvent.Timestamp;
        return Task.CompletedTask;
    }

    public Task ApplyAsync(IReadModelContext context, IDomainEvent<DataSourceAggregate, DataSourceId, DataSourceUnlockedEvent> domainEvent, CancellationToken cancellationToken)
    {
        Id = context.ReadModelId;
        DataSourceId = domainEvent.AggregateIdentity.GetGuid();
        IsLocked = false;
        UpdatedAt = domainEvent.Timestamp;
        return Task.CompletedTask;
    }

}
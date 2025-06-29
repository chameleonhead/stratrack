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
    IAmReadModelFor<DataSourceAggregate, DataSourceId, DataSourceDeletedEvent>
{
    public string Id { get; set; } = "";
    public Guid DataSourceId { get; set; } = Guid.Empty;
    public string Name { get; set; } = "";
    public string Symbol { get; set; } = "";
    public string Timeframe { get; set; } = "";
    public string SourceType { get; set; } = "";
    public string? Description { get; set; }
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
        SourceType = dataSourceCreatedEvent.SourceType;
        Description = dataSourceCreatedEvent.Description;
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

}
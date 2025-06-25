using EventFlow.Aggregates;
using Stratrack.Api.Domain.DataSources.Events;

namespace Stratrack.Api.Domain.DataSources;

public class DataSourceAggregate(DataSourceId id) : AggregateRoot<DataSourceAggregate, DataSourceId>(id),
    IEmit<DataSourceCreatedEvent>,
    IEmit<DataSourceUpdatedEvent>,
    IEmit<DataSourceDeletedEvent>
{
    private bool isDeleted = false;

    public string DataSourceName { get; private set; } = "";
    public string? Description { get; private set; }

    public void Create(string name, string? description)
    {
        Emit(new DataSourceCreatedEvent(Id, name, description));
    }

    public void Update(string name, string? description)
    {
        if (DataSourceName == name && Description == description)
        {
            return;
        }
        Emit(new DataSourceUpdatedEvent(Id, name, description));
    }

    public void Delete()
    {
        if (isDeleted == true)
        {
            return;
        }
        Emit(new DataSourceDeletedEvent(Id));
    }

    public void Apply(DataSourceCreatedEvent aggregateEvent)
    {
        DataSourceName = aggregateEvent.Name;
        Description = aggregateEvent.Description;
    }

    public void Apply(DataSourceUpdatedEvent aggregateEvent)
    {
        DataSourceName = aggregateEvent.Name;
        Description = aggregateEvent.Description;
    }

    public void Apply(DataSourceDeletedEvent aggregateEvent)
    {
        isDeleted = true;
    }
}

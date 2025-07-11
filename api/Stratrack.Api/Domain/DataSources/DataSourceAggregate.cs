using EventFlow.Aggregates;
using Stratrack.Api.Domain.DataSources.Events;

namespace Stratrack.Api.Domain.DataSources;

public class DataSourceAggregate(DataSourceId id) : AggregateRoot<DataSourceAggregate, DataSourceId>(id),
    IEmit<DataSourceCreatedEvent>,
    IEmit<DataSourceUpdatedEvent>,
    IEmit<DataSourceDeletedEvent>,
    IEmit<DataChunkRegisteredEvent>,
    IEmit<DataChunkDeletedEvent>
{
    private bool isDeleted = false;
    private bool isLocked = false;
    public string DataSourceName { get; private set; } = "";
    public string? Description { get; private set; }
    public string Symbol { get; private set; } = "";
    public string Timeframe { get; private set; } = "";
    public List<string> Fields { get; private set; } = [];
    public DataFormat Format { get; private set; } = DataFormat.Tick;
    public VolumeType Volume { get; private set; } = VolumeType.None;
    public bool IsLocked => isLocked;

    public void Create(string name, string symbol, string timeframe, DataFormat format, VolumeType volume, IEnumerable<string> fields, string? description)
    {
        if (isDeleted == true)
        {
            return;
        }
        if (DataSourceName == name
            && Symbol == symbol
            && Timeframe == timeframe
            && Fields.SequenceEqual(fields)
            && Format == format
            && Volume == volume
            && Description == description)
        {
            return;
        }

        // Assuming that the symbol, timeframe, and sourceType are not stored in this aggregate.
        // If they are needed, they should be added as properties and handled accordingly.
        Emit(new DataSourceCreatedEvent(Id, name, symbol, timeframe, format, volume, fields.ToList(), description));
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

    public void Lock()
    {
        if (!isLocked)
        {
            Emit(new DataSourceLockedEvent());
        }
    }

    public void Unlock()
    {
        if (isLocked)
        {
            Emit(new DataSourceUnlockedEvent());
        }
    }

    public void Apply(DataSourceCreatedEvent aggregateEvent)
    {
        DataSourceName = aggregateEvent.Name;
        Symbol = aggregateEvent.Symbol;
        Timeframe = aggregateEvent.Timeframe;
        Fields = aggregateEvent.Fields.ToList();
        Format = aggregateEvent.Format;
        Volume = aggregateEvent.Volume;
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

    public void RegisterDataChunk(Guid chunkId, Guid blobId, DateTimeOffset startTime, DateTimeOffset endTime)
    {
        if (isDeleted)
        {
            return;
        }

        Emit(new DataChunkRegisteredEvent(chunkId, blobId, startTime, endTime));
    }

    public void Apply(DataChunkRegisteredEvent aggregateEvent)
    {
    }

    public void DeleteDataChunk(Guid chunkId)
    {
        Emit(new DataChunkDeletedEvent(chunkId));
    }

    public void Apply(DataChunkDeletedEvent aggregateEvent)
    {
    }

    public void Apply(DataSourceLockedEvent aggregateEvent)
    {
        isLocked = true;
    }

    public void Apply(DataSourceUnlockedEvent aggregateEvent)
    {
        isLocked = false;
    }
}

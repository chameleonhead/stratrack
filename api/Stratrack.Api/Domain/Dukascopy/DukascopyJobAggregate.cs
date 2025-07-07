using EventFlow.Aggregates;
using Stratrack.Api.Domain.Dukascopy.Events;

namespace Stratrack.Api.Domain.Dukascopy;

public class DukascopyJobAggregate(DukascopyJobId id) : AggregateRoot<DukascopyJobAggregate, DukascopyJobId>(id),
    IEmit<DukascopyJobCreatedEvent>,
    IEmit<DukascopyJobStartedEvent>,
    IEmit<DukascopyJobStoppedEvent>,
    IEmit<DukascopyJobDeletedEvent>,
    IEmit<DukascopyJobExecutedEvent>
{
    public Guid DataSourceId { get; private set; }
    public string Symbol { get; private set; } = "";
    public DateTimeOffset StartTime { get; private set; }
    public bool IsDeleted { get; private set; }
    public bool IsRunning { get; private set; }
    public DateTimeOffset? LastExecutedAt { get; private set; }

    public void Create(string symbol, DateTimeOffset startTime)
    {
        if (IsDeleted == false && Symbol == symbol && StartTime == startTime && DataSourceId == Guid.Empty)
        {
            return;
        }

        Emit(new DukascopyJobCreatedEvent(symbol, startTime));
    }

    public void Update(Guid dataSourceId, DateTimeOffset startTime)
    {
        if (IsDeleted || IsRunning)
        {
            return;
        }

        if (DataSourceId == dataSourceId && StartTime == startTime)
        {
            return;
        }

        Emit(new DukascopyJobUpdatedEvent(dataSourceId, startTime));
    }

    public void Start()
    {
        if (!IsDeleted && !IsRunning && DataSourceId != Guid.Empty)
        {
            Emit(new DukascopyJobStartedEvent());
        }
    }

    public void Stop()
    {
        if (!IsDeleted && IsRunning)
        {
            Emit(new DukascopyJobStoppedEvent());
        }
    }

    public void Delete()
    {
        if (!IsDeleted)
        {
            Emit(new DukascopyJobDeletedEvent());
        }
    }

    public void LogExecution(DateTimeOffset executedAt)
    {
        Emit(new DukascopyJobExecutedEvent(executedAt));
    }

    public void Apply(DukascopyJobCreatedEvent aggregateEvent)
    {
        Symbol = aggregateEvent.Symbol;
        StartTime = aggregateEvent.StartTime;
        DataSourceId = Guid.Empty;
        IsDeleted = false;
        IsRunning = false;
    }

    public void Apply(DukascopyJobUpdatedEvent aggregateEvent)
    {
        DataSourceId = aggregateEvent.DataSourceId;
        StartTime = aggregateEvent.StartTime;
    }

    public void Apply(DukascopyJobStartedEvent aggregateEvent)
    {
        IsRunning = true;
    }

    public void Apply(DukascopyJobStoppedEvent aggregateEvent)
    {
        IsRunning = false;
    }

    public void Apply(DukascopyJobDeletedEvent aggregateEvent)
    {
        IsDeleted = true;
    }

    public void Apply(DukascopyJobExecutedEvent aggregateEvent)
    {
        LastExecutedAt = aggregateEvent.ExecutedAt;
    }
}

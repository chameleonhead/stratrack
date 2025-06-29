using EventFlow.Aggregates;
using Stratrack.Api.Domain.Dukascopy.Events;

namespace Stratrack.Api.Domain.Dukascopy;

public class DukascopyJobAggregate(DukascopyJobId id) : AggregateRoot<DukascopyJobAggregate, DukascopyJobId>(id),
    IEmit<DukascopyJobCreatedEvent>,
    IEmit<DukascopyJobStartedEvent>,
    IEmit<DukascopyJobStoppedEvent>,
    IEmit<DukascopyJobDeletedEvent>
{
    public string Symbol { get; private set; } = "";
    public DateTimeOffset StartTime { get; private set; }
    public bool IsDeleted { get; private set; }
    public bool IsRunning { get; private set; }

    public void Create(string symbol, DateTimeOffset startTime)
    {
        if (IsDeleted == false && Symbol == symbol && StartTime == startTime)
        {
            return;
        }

        Emit(new DukascopyJobCreatedEvent(symbol, startTime));
    }

    public void Start()
    {
        if (!IsDeleted && !IsRunning)
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

    public void Apply(DukascopyJobCreatedEvent aggregateEvent)
    {
        Symbol = aggregateEvent.Symbol;
        StartTime = aggregateEvent.StartTime;
        IsDeleted = false;
        IsRunning = false;
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
}

using EventFlow.Aggregates;
using Stratrack.Api.Domain.Dukascopy.Jobs.Events;

namespace Stratrack.Api.Domain.Dukascopy.Jobs;

public class DukascopyJobAggregate(DukascopyJobId id) : AggregateRoot<DukascopyJobAggregate, DukascopyJobId>(id),
    IEmit<DukascopyJobStartedEvent>,
    IEmit<DukascopyJobStoppedEvent>
{
    public bool IsRunning { get; private set; }

    public void Start()
    {
        if (!IsRunning)
        {
            Emit(new DukascopyJobStartedEvent());
        }
    }

    public void Stop()
    {
        if (IsRunning)
        {
            Emit(new DukascopyJobStoppedEvent());
        }
    }

    public void Apply(DukascopyJobStartedEvent aggregateEvent)
    {
        IsRunning = true;
    }

    public void Apply(DukascopyJobStoppedEvent aggregateEvent)
    {
        IsRunning = false;
    }
}

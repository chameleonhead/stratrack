using EventFlow.Aggregates;
using Stratrack.Api.Domain.Dukascopy.Events;

namespace Stratrack.Api.Domain.Dukascopy;

public class DukascopyJobAggregate(DukascopyJobId id) : AggregateRoot<DukascopyJobAggregate, DukascopyJobId>(id),
    IEmit<DukascopyJobCreatedEvent>,
    IEmit<DukascopyJobEnabledEvent>,
    IEmit<DukascopyJobDisabledEvent>,
    IEmit<DukascopyJobDeletedEvent>,
    IEmit<DukascopyJobExecutedEvent>,
    IEmit<DukascopyJobExecutionStartedEvent>,
    IEmit<DukascopyJobExecutionFinishedEvent>,
    IEmit<DukascopyJobExecutionInterruptRequestedEvent>,
    IEmit<DukascopyJobExecutionInterruptedEvent>
{
    public Guid DataSourceId { get; private set; }
    public string Symbol { get; private set; } = "";
    public DateTimeOffset StartTime { get; private set; }
    public bool IsDeleted { get; private set; }
    public bool IsEnabled { get; private set; }
    public DateTimeOffset? LastExecutedAt { get; private set; }
    public bool IsRunning { get; private set; }
    public DateTimeOffset? LastExecutionStartedAt { get; private set; }
    public DateTimeOffset? LastExecutionFinishedAt { get; private set; }
    public bool? LastExecutionSucceeded { get; private set; }
    public string? LastExecutionError { get; private set; }
    public Guid? CurrentExecutionId { get; private set; }
    public bool InterruptRequested { get; private set; }

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
        if (IsDeleted || IsEnabled)
        {
            return;
        }

        if (DataSourceId == dataSourceId && StartTime == startTime)
        {
            return;
        }

        Emit(new DukascopyJobUpdatedEvent(dataSourceId, startTime));
    }

    public void Enable()
    {
        if (!IsDeleted && !IsEnabled && DataSourceId != Guid.Empty)
        {
            Emit(new DukascopyJobEnabledEvent());
        }
    }

    public void Disable()
    {
        if (!IsDeleted && IsEnabled)
        {
            Emit(new DukascopyJobDisabledEvent());
        }
    }

    public void Delete()
    {
        if (!IsDeleted)
        {
            Emit(new DukascopyJobDeletedEvent());
        }
    }

    public void LogExecution(Guid executionId, DateTimeOffset executedAt, bool isSuccess, string symbol, DateTimeOffset targetTime, string? errorMessage, double duration)
    {
        Emit(new DukascopyJobExecutedEvent(executionId, executedAt, isSuccess, symbol, targetTime, errorMessage, duration));
    }

    public void StartExecution(Guid executionId)
    {
        if (!IsRunning)
        {
            Emit(new DukascopyJobExecutionStartedEvent(executionId, DateTimeOffset.UtcNow));
        }
    }

    public void FinishExecution(Guid executionId, bool isSuccess, string? errorMessage)
    {
        if (IsRunning && CurrentExecutionId == executionId)
        {
            Emit(new DukascopyJobExecutionFinishedEvent(executionId, DateTimeOffset.UtcNow, isSuccess, errorMessage));
        }
    }

    public void RequestInterrupt()
    {
        if (IsRunning && !InterruptRequested)
        {
            Emit(new DukascopyJobExecutionInterruptRequestedEvent());
        }
    }

    public void Interrupt(Guid executionId, string? errorMessage)
    {
        if (IsRunning && InterruptRequested && CurrentExecutionId == executionId)
        {
            Emit(new DukascopyJobExecutionInterruptedEvent(executionId, errorMessage));
        }
    }

    public void Apply(DukascopyJobCreatedEvent aggregateEvent)
    {
        Symbol = aggregateEvent.Symbol;
        StartTime = aggregateEvent.StartTime;
        DataSourceId = Guid.Empty;
        IsDeleted = false;
        IsEnabled = false;
    }

    public void Apply(DukascopyJobUpdatedEvent aggregateEvent)
    {
        DataSourceId = aggregateEvent.DataSourceId;
        StartTime = aggregateEvent.StartTime;
    }

    public void Apply(DukascopyJobEnabledEvent aggregateEvent)
    {
        IsEnabled = true;
    }

    public void Apply(DukascopyJobDisabledEvent aggregateEvent)
    {
        IsEnabled = false;
    }

    public void Apply(DukascopyJobDeletedEvent aggregateEvent)
    {
        IsDeleted = true;
    }

    public void Apply(DukascopyJobExecutedEvent aggregateEvent)
    {
        LastExecutedAt = aggregateEvent.ExecutedAt;
    }

    public void Apply(DukascopyJobExecutionStartedEvent aggregateEvent)
    {
        IsRunning = true;
        LastExecutionStartedAt = aggregateEvent.StartedAt;
        CurrentExecutionId = aggregateEvent.ExecutionId;
    }

    public void Apply(DukascopyJobExecutionFinishedEvent aggregateEvent)
    {
        IsRunning = false;
        LastExecutionFinishedAt = aggregateEvent.FinishedAt;
        LastExecutionSucceeded = aggregateEvent.IsSuccess;
        LastExecutionError = aggregateEvent.ErrorMessage;
        CurrentExecutionId = null;
    }

    public void Apply(DukascopyJobExecutionInterruptRequestedEvent aggregateEvent)
    {
        InterruptRequested = true;
    }

    public void Apply(DukascopyJobExecutionInterruptedEvent aggregateEvent)
    {
        IsRunning = false;
        InterruptRequested = false;
        LastExecutionFinishedAt = DateTimeOffset.UtcNow;
        LastExecutionSucceeded = false;
        LastExecutionError = aggregateEvent.ErrorMessage;
        CurrentExecutionId = null;
    }
}

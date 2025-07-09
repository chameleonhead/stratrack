using EventFlow.Commands;

namespace Stratrack.Api.Domain.Dukascopy.Commands;

public class DukascopyJobExecutionFinishCommand(DukascopyJobId aggregateId) : Command<DukascopyJobAggregate, DukascopyJobId>(aggregateId)
{
    public Guid ExecutionId { get; set; }
    public bool IsSuccess { get; set; }
    public string? ErrorMessage { get; set; }
}

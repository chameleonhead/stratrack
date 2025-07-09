using EventFlow.Commands;

namespace Stratrack.Api.Domain.Dukascopy.Commands;

public class DukascopyJobExecutionInterruptRequestCommand(DukascopyJobId aggregateId) : Command<DukascopyJobAggregate, DukascopyJobId>(aggregateId)
{
}

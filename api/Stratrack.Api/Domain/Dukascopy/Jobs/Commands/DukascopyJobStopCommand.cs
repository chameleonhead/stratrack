using EventFlow.Commands;

namespace Stratrack.Api.Domain.Dukascopy.Jobs.Commands;

public class DukascopyJobStopCommand(DukascopyJobId aggregateId) : Command<DukascopyJobAggregate, DukascopyJobId>(aggregateId);

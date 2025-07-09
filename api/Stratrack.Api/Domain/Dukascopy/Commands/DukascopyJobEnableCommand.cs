using EventFlow.Commands;

namespace Stratrack.Api.Domain.Dukascopy.Commands;

public class DukascopyJobEnableCommand(DukascopyJobId aggregateId) : Command<DukascopyJobAggregate, DukascopyJobId>(aggregateId);

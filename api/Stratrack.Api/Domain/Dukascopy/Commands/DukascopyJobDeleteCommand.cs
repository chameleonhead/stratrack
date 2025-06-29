using EventFlow.Commands;

namespace Stratrack.Api.Domain.Dukascopy.Commands;

public class DukascopyJobDeleteCommand(DukascopyJobId aggregateId) : Command<DukascopyJobAggregate, DukascopyJobId>(aggregateId);

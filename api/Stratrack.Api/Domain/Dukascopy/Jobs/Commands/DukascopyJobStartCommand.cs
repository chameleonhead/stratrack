using EventFlow.Commands;

namespace Stratrack.Api.Domain.Dukascopy.Jobs.Commands;

public class DukascopyJobStartCommand(DukascopyJobId aggregateId) : Command<DukascopyJobAggregate, DukascopyJobId>(aggregateId);

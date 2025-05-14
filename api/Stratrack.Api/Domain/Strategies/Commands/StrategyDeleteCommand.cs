using EventFlow.Commands;

namespace Stratrack.Api.Domain.Strategies.Commands;

public class StrategyDeleteCommand(StrategyId aggregateId) : Command<StrategyAggregate, StrategyId>(aggregateId)
{
}

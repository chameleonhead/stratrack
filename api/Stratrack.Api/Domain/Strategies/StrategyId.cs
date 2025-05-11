using EventFlow.Core;

namespace Stratrack.Api.Domain.Strategies;

public class StrategyId(string value) : Identity<StrategyId>(value)
{
}
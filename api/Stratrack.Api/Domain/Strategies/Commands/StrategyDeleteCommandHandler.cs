using EventFlow.Commands;

namespace Stratrack.Api.Domain.Strategies.Commands;

public class StrategyDeleteCommandHandler : CommandHandler<StrategyAggregate, StrategyId, StrategyDeleteCommand>
{
    public override Task ExecuteAsync(StrategyAggregate aggregate, StrategyDeleteCommand command, CancellationToken cancellationToken)
    {
        aggregate.Delete();
        return Task.CompletedTask;
    }
}

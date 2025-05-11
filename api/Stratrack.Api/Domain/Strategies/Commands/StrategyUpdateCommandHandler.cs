using EventFlow.Commands;

namespace Stratrack.Api.Domain.Strategies.Commands;

public class StrategyUpdateCommandHandler : CommandHandler<StrategyAggregate, StrategyId, StrategyUpdateCommand>
{
    public override Task ExecuteAsync(StrategyAggregate aggregate, StrategyUpdateCommand command, CancellationToken cancellationToken)
    {
        aggregate.Update(command.Name, command.Description, command.Tags);
        aggregate.Update(command.Template, command.GeneratedCode);
        return Task.CompletedTask;
    }
}

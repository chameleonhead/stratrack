using EventFlow.Commands;

namespace Stratrack.Api.Domain.Strategies.Commands;

public class StrategyCreateCommandHandler : CommandHandler<StrategyAggregate, StrategyId, StrategyCreateCommand>
{
    public override Task ExecuteAsync(StrategyAggregate aggregate, StrategyCreateCommand command, CancellationToken cancellationToken)
    {
        aggregate.Create(command.Name, command.Description, command.Tags, command.Template, command.GeneratedCode);
        return Task.CompletedTask;
    }
}

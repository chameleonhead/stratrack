using EventFlow.Commands;

namespace Stratrack.Api.Domain.Dukascopy.Commands;

public class DukascopyJobProcessFinishCommandHandler : CommandHandler<DukascopyJobAggregate, DukascopyJobId, DukascopyJobProcessFinishCommand>
{
    public override Task ExecuteAsync(DukascopyJobAggregate aggregate, DukascopyJobProcessFinishCommand command, CancellationToken cancellationToken)
    {
        aggregate.FinishProcess(command.IsSuccess, command.ErrorMessage);
        return Task.CompletedTask;
    }
}

using EventFlow.Commands;

namespace Stratrack.Api.Domain.Dukascopy.Commands;

public class DukascopyJobRecordFetchResultCommandHandler : CommandHandler<DukascopyJobAggregate, DukascopyJobId, DukascopyJobRecordFetchResultCommand>
{
    public override Task ExecuteAsync(DukascopyJobAggregate aggregate, DukascopyJobRecordFetchResultCommand command, CancellationToken cancellationToken)
    {
        aggregate.RecordFetchResult(
            command.ExecutionId,
            command.ExecutedAt,
            command.IsSuccess,
            command.Symbol,
            command.TargetTime,
            command.FileUrl,
            command.HttpStatus,
            command.ETag,
            command.LastModified,
            command.ErrorMessage,
            command.Duration);
        return Task.CompletedTask;
    }
}

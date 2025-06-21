using System.Threading;
using System.Threading.Tasks;
using EventFlow;
using EventFlow.Aggregates;
using EventFlow.Aggregates.ExecutionResults;
using EventFlow.Commands;
using EventFlow.Core;

namespace Stratrack.Api.Tests;

public class FailingCommandBus : ICommandBus
{
    public Task<TExecutionResult> PublishAsync<TAggregate, TIdentity, TExecutionResult>(
        ICommand<TAggregate, TIdentity, TExecutionResult> command,
        CancellationToken cancellationToken)
        where TAggregate : IAggregateRoot<TIdentity>
        where TIdentity : IIdentity
        where TExecutionResult : IExecutionResult
    {
        return Task.FromException<TExecutionResult>(new Exception("fail"));
    }
}

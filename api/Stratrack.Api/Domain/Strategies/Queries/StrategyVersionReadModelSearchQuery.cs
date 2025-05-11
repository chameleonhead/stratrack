using EventFlow.Queries;

namespace Stratrack.Api.Domain.Strategies.Queries;

public class StrategyVersionReadModelSearchQuery : IQuery<IReadOnlyCollection<StrategyVersionReadModel>>
{
    public Guid? StrategyId { get; set; }
}

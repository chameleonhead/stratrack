using EventFlow.Core;
using EventFlow.MsSql;
using EventFlow.Queries;
using EventFlow.Sql.ReadModels;

namespace Stratrack.Api.Domain.Strategies.Queries;

public class MssqlStrategyReadModelSearchQueryHandler(MsSqlConnection connection, IReadModelSqlGenerator readModelSqlGenerator) : IQueryHandler<StrategyReadModelSearchQuery, IReadOnlyCollection<StrategyReadModel>>
{
    public Task<IReadOnlyCollection<StrategyReadModel>> ExecuteQueryAsync(StrategyReadModelSearchQuery query, CancellationToken cancellationToken)
    {
        var sql = readModelSqlGenerator.CreateSelectSql<StrategyReadModel>();
        return connection.QueryAsync<StrategyReadModel>(Label.Named("select-query"), "StratrackDb", cancellationToken, sql);
    }
}

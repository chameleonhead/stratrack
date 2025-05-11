using EventFlow.Core;
using EventFlow.MsSql;
using EventFlow.Queries;
using EventFlow.Sql.ReadModels;
using System.Text;

namespace Stratrack.Api.Domain.Strategies.Queries;

public class MssqlStrategyVersionReadModelSearchQueryHandler(MsSqlConnection connection, IReadModelSqlGenerator readModelSqlGenerator) : IQueryHandler<StrategyVersionReadModelSearchQuery, IReadOnlyCollection<StrategyVersionReadModel>>
{
    public Task<IReadOnlyCollection<StrategyVersionReadModel>> ExecuteQueryAsync(StrategyVersionReadModelSearchQuery query, CancellationToken cancellationToken)
    {
        var sql = readModelSqlGenerator.CreateSelectSql<StrategyVersionReadModel>();
        var where = new List<string>();
        if (query.StrategyId != null)
        {
            where.Add("StrategyIdGuid = @StrategyId");
        }
        if (where.Count != 0)
        {
            sql = new StringBuilder(sql).Append(" WHERE ").Append(string.Join(" AND ", where)).ToString();
        }
        return connection.QueryAsync<StrategyVersionReadModel>(Label.Named("select-query-version"), "StratrackDb", cancellationToken, sql, new
        {
            StrateyId = query.StrategyId,
        });
    }
}

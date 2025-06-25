using EventFlow.EntityFramework;
using EventFlow.Queries;
using Microsoft.EntityFrameworkCore;

namespace Stratrack.Api.Domain.DataSources.Queries;

public class DataSourceReadModelSearchQueryHandler(IDbContextProvider<StratrackDbContext> dbContextProvider) : IQueryHandler<DataSourceReadModelSearchQuery, IReadOnlyCollection<DataSourceReadModel>>
{
    public async Task<IReadOnlyCollection<DataSourceReadModel>> ExecuteQueryAsync(DataSourceReadModelSearchQuery query, CancellationToken cancellationToken)
    {
        using var context = dbContextProvider.CreateContext();
        return await context.DataSources.ToListAsync(cancellationToken).ConfigureAwait(false);
    }
}

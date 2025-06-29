using EventFlow.EntityFramework;
using EventFlow.Queries;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace Stratrack.Api.Domain.DataSources.Queries;

public class DataChunkReadModelSearchQueryHandler(IDbContextProvider<StratrackDbContext> dbContextProvider) : IQueryHandler<DataChunkReadModelSearchQuery, IReadOnlyCollection<DataChunkReadModel>>
{
    public async Task<IReadOnlyCollection<DataChunkReadModel>> ExecuteQueryAsync(DataChunkReadModelSearchQuery query, CancellationToken cancellationToken)
    {
        using var context = dbContextProvider.CreateContext();
        return await context.DataChunks
            .Where(c => c.DataSourceId == query.DataSourceId)
            .ToListAsync(cancellationToken)
            .ConfigureAwait(false);
    }
}

using EventFlow.EntityFramework;
using EventFlow.Queries;
using Microsoft.EntityFrameworkCore;

namespace Stratrack.Api.Domain.DataSources.Queries;

public class DataChunkRangeQueryHandler(IDbContextProvider<StratrackDbContext> dbContextProvider)
    : IQueryHandler<DataChunkRangeQuery, DataChunkRange?>
{
    public async Task<DataChunkRange?> ExecuteQueryAsync(DataChunkRangeQuery query, CancellationToken cancellationToken)
    {
        using var context = dbContextProvider.CreateContext();
        var chunks = context.DataChunks.Where(c => c.DataSourceId == query.DataSourceId);
        var start = await chunks.MinAsync(c => (DateTimeOffset?)c.StartTime, cancellationToken).ConfigureAwait(false);
        var end = await chunks.MaxAsync(c => (DateTimeOffset?)c.EndTime, cancellationToken).ConfigureAwait(false);
        if (start == null || end == null)
        {
            return null;
        }
        return new DataChunkRange { StartTime = start, EndTime = end };
    }
}

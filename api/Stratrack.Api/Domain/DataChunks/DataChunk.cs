using Stratrack.Api.Domain.Blobs;
using Stratrack.Api.Domain.DataSources;

namespace Stratrack.Api.Domain.DataChunks;

public class DataChunk
{
    public Guid Id { get; set; }
    public Guid DataSourceId { get; set; }
    public DataSourceReadModel? DataSource { get; set; }
    public Guid BlobId { get; set; }
    public BlobEntity? Blob { get; set; }
    public DateTimeOffset StartTime { get; set; }
    public DateTimeOffset EndTime { get; set; }
}

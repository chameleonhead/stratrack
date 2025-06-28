namespace Stratrack.Api.Domain.DataSources;

public class DataChunkEntity
{
    public Guid Id { get; set; }
    public Guid DataSourceId { get; set; }
    public DataSourceReadModel? DataSource { get; set; }
    public Guid BlobId { get; set; }
    public DateTimeOffset StartTime { get; set; }
    public DateTimeOffset EndTime { get; set; }
}

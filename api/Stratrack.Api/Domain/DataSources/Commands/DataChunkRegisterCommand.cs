using EventFlow.Commands;

namespace Stratrack.Api.Domain.DataSources.Commands;

public class DataChunkRegisterCommand(DataSourceId aggregateId) : Command<DataSourceAggregate, DataSourceId>(aggregateId)
{
    public Guid BlobId { get; set; }
    public DateTimeOffset StartTime { get; set; }
    public DateTimeOffset EndTime { get; set; }
}

using EventFlow.Commands;
using System;

namespace Stratrack.Api.Domain.DataSources.Commands;

public class DataChunkRegisterCommand(DataSourceId aggregateId) : Command<DataSourceAggregate, DataSourceId>(aggregateId)
{
    public Guid DataChunkId { get; set; }
    public Guid BlobId { get; set; }
    public DateTimeOffset StartTime { get; set; }
    public DateTimeOffset EndTime { get; set; }
}

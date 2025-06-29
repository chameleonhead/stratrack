using EventFlow.Commands;
using System;
using System.Collections.Generic;

namespace Stratrack.Api.Domain.DataSources.Commands;

public class DataChunkDeleteCommand(DataSourceId aggregateId) : Command<DataSourceAggregate, DataSourceId>(aggregateId)
{
    public IReadOnlyCollection<Guid> DataChunkIds { get; set; } = Array.Empty<Guid>();
}

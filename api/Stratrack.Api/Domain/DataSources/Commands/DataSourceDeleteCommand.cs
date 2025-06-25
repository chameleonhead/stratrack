using EventFlow.Commands;

namespace Stratrack.Api.Domain.DataSources.Commands;

public class DataSourceDeleteCommand(DataSourceId aggregateId) : Command<DataSourceAggregate, DataSourceId>(aggregateId)
{
}

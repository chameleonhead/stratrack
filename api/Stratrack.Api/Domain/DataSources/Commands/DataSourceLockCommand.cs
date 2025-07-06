using EventFlow.Commands;

namespace Stratrack.Api.Domain.DataSources.Commands;

public class DataSourceLockCommand(DataSourceId aggregateId) : Command<DataSourceAggregate, DataSourceId>(aggregateId);

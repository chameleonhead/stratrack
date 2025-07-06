using EventFlow.Commands;

namespace Stratrack.Api.Domain.DataSources.Commands;

public class DataSourceUnlockCommand(DataSourceId aggregateId) : Command<DataSourceAggregate, DataSourceId>(aggregateId);

using EventFlow.Aggregates;
using EventFlow.EventStores;

namespace Stratrack.Api.Domain.DataSources.Events
{
    [EventVersion("DataSourceCreated", 1)]
    public class DataSourceCreatedEvent(DataSourceId id, string name, string symbol, string timeframe, string sourceType, string? description) : AggregateEvent<DataSourceAggregate, DataSourceId>
    {
        public DataSourceId Id { get; } = id;
        public string Name { get; } = name;
        public string Symbol { get; internal set; } = symbol;
        public string Timeframe { get; internal set; } = timeframe;
        public string SourceType { get; internal set; } = sourceType;
        public string? Description { get; } = description;
    }
}
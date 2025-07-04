using EventFlow.Aggregates;
using EventFlow.EventStores;
using Stratrack.Api.Domain.DataSources;

namespace Stratrack.Api.Domain.DataSources.Events
{
    [EventVersion("DataSourceCreated", 1)]
    public class DataSourceCreatedEvent(DataSourceId id, string name, string symbol, string timeframe, DataFormat format, VolumeType volume, IReadOnlyCollection<string> fields, string? description) : AggregateEvent<DataSourceAggregate, DataSourceId>
    {
        public DataSourceId Id { get; } = id;
        public string Name { get; } = name;
        public string Symbol { get; internal set; } = symbol;
        public string Timeframe { get; internal set; } = timeframe;
        public DataFormat Format { get; internal set; } = format;
        public VolumeType Volume { get; internal set; } = volume;
        public IReadOnlyCollection<string> Fields { get; internal set; } = fields;
        public string? Description { get; } = description;
    }
}
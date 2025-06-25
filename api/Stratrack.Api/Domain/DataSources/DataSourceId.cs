using EventFlow.Core;

namespace Stratrack.Api.Domain.DataSources;

public class DataSourceId(string value) : Identity<DataSourceId>(value)
{
}
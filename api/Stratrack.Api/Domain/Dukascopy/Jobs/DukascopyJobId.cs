using EventFlow.Core;

namespace Stratrack.Api.Domain.Dukascopy.Jobs;

public class DukascopyJobId(string value) : Identity<DukascopyJobId>(value)
{
}

using EventFlow.Core;

namespace Stratrack.Api.Domain.Dukascopy;

public class DukascopyJobId(string value) : Identity<DukascopyJobId>(value)
{
}

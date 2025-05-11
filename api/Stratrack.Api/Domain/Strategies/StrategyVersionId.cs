using EventFlow.Core;
using System.Security.Cryptography;
using System.Text;

namespace Stratrack.Api.Domain.Strategies;

public class StrategyVersionId(string value) : Identity<StrategyVersionId>(value)
{
    public static StrategyVersionId From(StrategyId id, int version)
    {
        var idstr = $"{id.GetGuid()}:{version}";
        byte[] hash = SHA1.HashData(Encoding.UTF8.GetBytes(idstr));
        return With(new Guid([.. hash.Take(16)]));
    }
}

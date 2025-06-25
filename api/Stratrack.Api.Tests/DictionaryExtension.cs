using System.Text.Json;

namespace Stratrack.Api.Tests;

public static class DictionaryExtension
{
    public static JsonElement ToJsonElement(this Dictionary<string, object> dictionary)
    {
        var json = JsonSerializer.Serialize(dictionary);
        using var doc = JsonDocument.Parse(json);
        return doc.RootElement.Clone();
    }
}

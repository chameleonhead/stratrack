import { describe, it, expect, vi } from "vitest";
import { createStrategy, updateStrategy } from "./strategies";

describe("createStrategy", () => {
  it("serializes template without ValueKind", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "1" }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const template = { foo: [] };

    await createStrategy({ name: "s", template });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.template.foo.ValueKind).toBeUndefined();
    expect(body.template.foo).toEqual([]);
  });
});

describe("updateStrategy", () => {
  it("serializes template without ValueKind", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "1" }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const template = { foo: [] };

    await updateStrategy("1", { name: "s", template });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.template.foo.ValueKind).toBeUndefined();
    expect(body.template.foo).toEqual([]);
  });
});

import { describe, it, expect, vi } from "vitest";
import { createStrategy } from "./strategies";

describe("createStrategy", () => {
  it("serializes template without ValueKind", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "1" }),
    });
    // @ts-ignore
    global.fetch = fetchMock;

    class FakeJsonElement {
      constructor(public v: number) {}
      toJSON() {
        return { ValueKind: "", v: this.v };
      }
    }

    const template = { foo: new FakeJsonElement(2) } as any;

    await createStrategy({ name: "s", template });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.template.foo.ValueKind).toBeUndefined();
    expect(body.template.foo.v).toBe(2);
  });
});

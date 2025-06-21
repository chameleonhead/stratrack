import { describe, it, expect, vi } from "vitest";
import { createStrategy } from "./strategies";

describe("createStrategy", () => {
  it("serializes template without ValueKind", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "1" }),
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    global.fetch = fetchMock;

    const template = { foo: [] };

    await createStrategy({ name: "s", template });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.template.foo.ValueKind).toBeUndefined();
    expect(body.template.foo).toEqual([]);
  });
});

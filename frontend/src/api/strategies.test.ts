import { describe, it, expect, vi } from "vitest";
import { createStrategy, updateStrategy } from "./strategies";

const okResponse = { ok: true, json: async () => ({ id: "1" }) } as Response;

describe("createStrategy", () => {
  it("sends plain JSON payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse);
    global.fetch = fetchMock as unknown as typeof fetch;

    const data = { name: "s", template: { foo: [] } };

    await createStrategy(data);

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body).toEqual(data);
  });
});

describe("updateStrategy", () => {
  it("sends plain JSON payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse);
    global.fetch = fetchMock as unknown as typeof fetch;

    const data = { name: "s", template: { foo: [] } };

    await updateStrategy("1", data);

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body).toEqual(data);
  });
});

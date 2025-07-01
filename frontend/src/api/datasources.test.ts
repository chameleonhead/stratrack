import { describe, it, expect, vi } from "vitest";
import { createDataSource, updateDataSource } from "./datasources";

const okResponse = { ok: true, json: async () => ({ id: "1" }) } as Response;

describe("createDataSource", () => {
  it("sends plain JSON payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse);
    global.fetch = fetchMock as unknown as typeof fetch;

    const data = {
      name: "ds",
      symbol: "EURUSD",
      timeframe: "1m",
      sourceType: "dukascopy",
    };

    await createDataSource(data);

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body).toEqual(data);
  });
});

describe("updateDataSource", () => {
  it("sends plain JSON payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse);
    global.fetch = fetchMock as unknown as typeof fetch;

    const data = { name: "ds" };

    await updateDataSource("1", data);

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body).toEqual(data);
  });
});

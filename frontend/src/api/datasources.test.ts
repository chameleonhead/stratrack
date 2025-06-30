import { describe, it, expect, vi } from "vitest";
import { createDataSource, updateDataSource } from "./datasources";

describe("createDataSource", () => {
  it("serializes payload without ValueKind", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: "1" }) });
    global.fetch = fetchMock as unknown as typeof fetch;

    await createDataSource({
      name: "ds",
      symbol: "EURUSD",
      timeframe: "1m",
      sourceType: "dukascopy",
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.symbol).toBe("EURUSD");
  });
});

describe("updateDataSource", () => {
  it("serializes payload without ValueKind", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: "1" }) });
    global.fetch = fetchMock as unknown as typeof fetch;

    await updateDataSource("1", { name: "ds" });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.name).toBe("ds");
  });
});

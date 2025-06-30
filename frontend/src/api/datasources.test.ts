import { describe, it, expect, vi } from "vitest";
import { createDataSource, updateDataSource } from "./datasources";

type DsFn = (data: any) => Promise<unknown>;

const cases: [string, DsFn, () => any][] = [
  [
    "createDataSource",
    createDataSource as unknown as DsFn,
    () => ({ name: "ds", symbol: "EURUSD", timeframe: "1m", sourceType: "dukascopy" }),
  ],
  ["updateDataSource", (data) => updateDataSource("1", data as any), () => ({ name: "ds" })],
];

describe.each(cases)("%s", (_, fn, makeData) => {
  it("sends plain JSON payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: "1" }) });
    global.fetch = fetchMock as unknown as typeof fetch;

    const data = makeData();

    await fn(data);

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).toEqual(data);
  });
});

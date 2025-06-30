import { describe, it, expect, vi } from "vitest";
import { createStrategy, updateStrategy } from "./strategies";

type StrategyFn = (data: Parameters<typeof createStrategy>[0]) => Promise<unknown>;

const cases: [string, StrategyFn, () => Parameters<StrategyFn>[0]][] = [
  ["createStrategy", createStrategy, () => ({ name: "s", template: { foo: [] } })],
  [
    "updateStrategy",
    (data) => updateStrategy("1", data),
    () => ({ name: "s", template: { foo: [] } }),
  ],
];

describe.each(cases)("%s", (_, fn, makeData) => {
  it("sends plain JSON payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "1" }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const data = makeData();

    await fn(data);

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).toEqual(data);
  });
});

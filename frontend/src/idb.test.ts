import "fake-indexeddb/auto";
import { describe, it, expect, beforeEach } from "vitest";
import { saveCandles, hasCandles } from "./idb";

const baseTime = Date.parse("2024-01-01T00:00:00Z");

async function seed(count: number) {
  const candles = Array.from({ length: count }, (_, i) => ({
    dataSourceId: "ds",
    timeframe: "1h",
    time: baseTime + i * 60 * 60 * 1000,
    open: 1,
    high: 1,
    low: 1,
    close: 1,
  }));
  await saveCandles("ds", "1h", candles);
}

describe("hasCandles", () => {
  beforeEach(async () => {
    await new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase("stratrack");
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
      req.onblocked = () => resolve();
    });
  });

  it("returns false when range is partially cached", async () => {
    await seed(19); // up to 18:00
    const ok = await hasCandles("ds", "1h", baseTime, baseTime + 20 * 60 * 60 * 1000);
    expect(ok).toBe(false);
  });

  it("returns true when full range is cached", async () => {
    await seed(20); // up to 19:00
    const ok = await hasCandles("ds", "1h", baseTime, baseTime + 20 * 60 * 60 * 1000);
    expect(ok).toBe(true);
  });
});

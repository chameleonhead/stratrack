import { describe, it, expect, beforeEach } from "vitest";
import { iEnvelopes, iEnvelopesOnArray } from "../../src/ta/envelopes";
import { InMemoryIndicatorEngine } from "../../src/libs/domain/indicator";
import { InMemoryMarketData } from "../../src/libs/domain/marketData";
import type { ExecutionContext } from "../../src/libs/domain/types";
import type { Candle } from "../../src/libs/domain/marketData";

describe("iEnvelopes", () => {
  let context: ExecutionContext;
  let candles: Candle[];
  beforeEach(() => {
    candles = [
      { time: 1000, open: 1.0, high: 1.1, low: 0.9, close: 1.05, volume: 1000 },
      { time: 2000, open: 1.05, high: 1.15, low: 1.0, close: 1.1, volume: 1100 },
      { time: 3000, open: 1.1, high: 1.2, low: 1.05, close: 1.15, volume: 1200 },
      { time: 4000, open: 1.15, high: 1.25, low: 1.1, close: 1.2, volume: 1300 },
      { time: 5000, open: 1.2, high: 1.3, low: 1.15, close: 1.25, volume: 1400 },
    ];
    const market = new InMemoryMarketData({}, { GBPUSD: { 15: candles } });
    context = {
      terminal: null,
      broker: null,
      account: null,
      market,
      symbol: "GBPUSD",
      timeframe: 15,
      indicatorEngine: new InMemoryIndicatorEngine(),
    };
  });

  it("calculates envelopes", () => {
    const upper = iEnvelopes(context, "GBPUSD", 15, 3, 0, 0, 0, 10, 1, 0);
    const lower = iEnvelopes(context, "GBPUSD", 15, 3, 0, 0, 0, 10, 2, 0);
    const main = iEnvelopes(context, "GBPUSD", 15, 3, 0, 0, 0, 10, 0, 0);
    expect(upper).toBeCloseTo(1.32, 6);
    expect(lower).toBeCloseTo(1.08, 6);
    expect(main).toBeCloseTo(1.2, 6);
  });

  it("calculates envelopes on array", () => {
    const arr = candles.map((c) => c.close);
    const upper = iEnvelopesOnArray(arr, arr.length, 3, 0, 0, 10, 1, 0);
    const lower = iEnvelopesOnArray(arr, arr.length, 3, 0, 0, 10, 2, 0);
    const main = iEnvelopesOnArray(arr, arr.length, 3, 0, 0, 10, 0, 0);
    expect(upper).toBeCloseTo(1.32, 6);
    expect(lower).toBeCloseTo(1.08, 6);
    expect(main).toBeCloseTo(1.2, 6);
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import { iBands, iBandsOnArray } from "../../src/ta/bands";
import { InMemoryIndicatorEngine } from "../../src/libs/domain/indicator";
import { InMemoryMarketData } from "../../src/libs/domain/marketData";
import type { ExecutionContext } from "../../src/libs/domain/types";
import type { Candle } from "../../src/libs/domain/marketData";

describe("iBands", () => {
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

  it("calculates Bollinger Bands", () => {
    const upper = iBands(context, "GBPUSD", 15, 3, 2, 0, 0, 0, 0);
    const lower = iBands(context, "GBPUSD", 15, 3, 2, 0, 0, 1, 0);
    const middle = iBands(context, "GBPUSD", 15, 3, 2, 0, 0, 2, 0);
    expect(upper).toBeCloseTo(1.281649658, 6);
    expect(lower).toBeCloseTo(1.118350342, 6);
    expect(middle).toBeCloseTo(1.2, 6);
  });

  it("calculates Bollinger Bands on array", () => {
    const arr = candles.map((c) => c.close);
    const upper = iBandsOnArray(arr, arr.length, 3, 2, 0, 0, 0);
    const lower = iBandsOnArray(arr, arr.length, 3, 2, 0, 1, 0);
    const middle = iBandsOnArray(arr, arr.length, 3, 2, 0, 2, 0);
    expect(upper).toBeCloseTo(1.281649658, 6);
    expect(lower).toBeCloseTo(1.118350342, 6);
    expect(middle).toBeCloseTo(1.2, 6);
  });
});

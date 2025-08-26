import { describe, it, expect, beforeEach } from "vitest";
import { iRSI, iRSIOnArray } from "../../src/ta/rsi";
import { InMemoryIndicatorEngine } from "../../src/libs/domain/indicator";
import { InMemoryMarketData } from "../../src/libs/domain/marketData";
import type { ExecutionContext } from "../../src/libs/domain/types";
import type { Candle } from "../../src/libs/domain/marketData";

describe("iRSI", () => {
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

  it("calculates relative strength index", () => {
    const res = iRSI(context, "GBPUSD", 15, 3, 6, 0);
    expect(res).toBe(100);
  });

  it("uses indicator cache", () => {
    const engine = context.indicatorEngine! as InMemoryIndicatorEngine;
    const key = {
      type: "iRSI",
      symbol: "GBPUSD",
      timeframe: 15,
      params: { period: 3, applied: 6 },
    } as const;
    iRSI(context, "GBPUSD", 15, 3, 6, 0);
    const state = engine.peek<any>(key)!;
    expect(state.last).toBe(candles.length - 1);
    iRSI(context, "GBPUSD", 15, 3, 6, 1);
    const again = engine.peek<any>(key)!;
    expect(again).toBe(state);
  });

  it("calculates RSI on array", () => {
    const arr = [1, 2, 3, 2, 3, 4];
    const res = iRSIOnArray(arr, arr.length, 3, 0);
    expect(res).toBeCloseTo(66.6666667, 6);
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import { iMA, iMAOnArray } from "../../src/ta/ma";
import { InMemoryIndicatorEngine } from "../../src/libs/domain/indicator";
import { InMemoryMarketData } from "../../src/libs/domain/marketData";
import type { ExecutionContext } from "../../src/libs/domain/types";
import type { Candle } from "../../src/libs/domain/marketData";

describe("iMA", () => {
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

  it("calculates simple moving average", () => {
    const res = iMA(context, "GBPUSD", 15, 3, 0, 0, 6, 0);
    expect(res).toBeCloseTo(1.1875, 4);
  });

  it("calculates exponential moving average", () => {
    const res = iMA(context, "GBPUSD", 15, 3, 0, 1, 6, 0);
    expect(res).toBeCloseTo(1.18984375, 8);
  });

  it("calculates smoothed moving average", () => {
    const res = iMA(context, "GBPUSD", 15, 3, 0, 2, 6, 0);
    expect(res).toBeCloseTo(1.15787037, 8);
  });

  it("calculates linear weighted moving average", () => {
    const res = iMA(context, "GBPUSD", 15, 3, 0, 3, 6, 0);
    expect(res).toBeCloseTo(1.20416667, 8);
  });

  it("uses indicator cache", () => {
    const engine = context.indicatorEngine! as InMemoryIndicatorEngine;
    const key = {
      type: "iMA",
      symbol: "GBPUSD",
      timeframe: 15,
      params: { period: 3, maMethod: 0, applied: 6 },
    } as const;
    iMA(context, "GBPUSD", 15, 3, 0, 0, 6, 0);
    const state = engine.peek<any>(key)!;
    expect(state.last).toBe(candles.length - 1);
    const before = state.values[state.last];
    iMA(context, "GBPUSD", 15, 3, 0, 0, 6, 0);
    const after = engine.peek<any>(key)!;
    expect(after).toBe(state);
    expect(after.values[after.last]).toBe(before);
  });

  it("calculates moving average on array", () => {
    const arr = [1, 2, 3, 4, 5];
    const res = iMAOnArray(arr, arr.length, 3, 0, 0, 0);
    expect(res).toBe(4);
  });

  it("calculates EMA on array", () => {
    const arr = [1, 2, 3, 4, 5];
    const res = iMAOnArray(arr, arr.length, 3, 0, 1, 0);
    expect(res).toBeCloseTo(4.0625, 8);
  });

  it("calculates SMMA on array", () => {
    const arr = [1, 2, 3, 4, 5];
    const res = iMAOnArray(arr, arr.length, 3, 0, 2, 0);
    expect(res).toBeCloseTo(3.44444444, 8);
  });

  it("calculates LWMA on array", () => {
    const arr = [1, 2, 3, 4, 5];
    const res = iMAOnArray(arr, arr.length, 3, 0, 3, 0);
    expect(res).toBeCloseTo(4.33333333, 8);
  });
});

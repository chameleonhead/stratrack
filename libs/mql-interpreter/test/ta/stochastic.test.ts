import { describe, it, expect, beforeEach } from "vitest";
import { iStochastic } from "../../src/ta/stochastic";
import { InMemoryIndicatorEngine } from "../../src/libs/domain/indicator";
import { InMemoryMarketData } from "../../src/libs/domain/marketData";
import type { ExecutionContext } from "../../src/libs/domain/types";
import type { Candle } from "../../src/libs/domain/marketData";

describe("iStochastic", () => {
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

  it("calculates stochastic %K", () => {
    const res = iStochastic(context, "GBPUSD", 15, 3, 3, 1, 0, 0, 0, 0);
    expect(res).toBeCloseTo(80, 8);
  });

  it("calculates stochastic %D", () => {
    const res = iStochastic(context, "GBPUSD", 15, 3, 3, 1, 0, 0, 1, 0);
    expect(res).toBeCloseTo(81.1111, 4);
  });

  it("uses indicator cache", () => {
    const engine = context.indicatorEngine! as InMemoryIndicatorEngine;
    const key = {
      type: "iStochastic",
      symbol: "GBPUSD",
      timeframe: 15,
      params: { k_period: 3, d_period: 3, slowing: 1, price_field: 0 },
    } as const;
    iStochastic(context, "GBPUSD", 15, 3, 3, 1, 0, 0, 0, 0);
    const state = engine.peek<any>(key)!;
    expect(state.last).toBe(candles.length - 1);
    const beforeK = state.k[state.last];
    iStochastic(context, "GBPUSD", 15, 3, 3, 1, 0, 0, 1, 0);
    const again = engine.peek<any>(key)!;
    expect(again).toBe(state);
    expect(again.k[again.last]).toBe(beforeK);
  });
});

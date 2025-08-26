import { describe, it, expect, beforeEach } from "vitest";
import { iAO } from "../../src/ta/ao";
import { InMemoryIndicatorEngine } from "../../src/libs/domain/indicator";
import { InMemoryMarketData } from "../../src/libs/domain/marketData";
import type { ExecutionContext } from "../../src/libs/domain/types";
import type { Candle } from "../../src/libs/domain/marketData";

describe("iAO", () => {
  let context: ExecutionContext;
  let candles: Candle[];
  beforeEach(() => {
    candles = [];
    for (let i = 0; i < 40; i++) {
      const price = 1 + i * 0.01;
      candles.push({
        time: i,
        open: price,
        high: price + 0.05,
        low: price - 0.05,
        close: price,
        volume: 1000 + i,
      });
    }
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

  it("calculates Awesome Oscillator", () => {
    const res = iAO(context, "GBPUSD", 15, 0);
    expect(res).toBeCloseTo(0.145, 6);
  });

  it("uses indicator cache", () => {
    const engine = context.indicatorEngine! as InMemoryIndicatorEngine;
    const key = { type: "iAO", symbol: "GBPUSD", timeframe: 15 } as const;
    iAO(context, "GBPUSD", 15, 0);
    const state = engine.peek<any>(key)!;
    expect(state.last).toBe(candles.length - 1);
    iAO(context, "GBPUSD", 15, 1);
    const again = engine.peek<any>(key)!;
    expect(again).toBe(state);
  });
});

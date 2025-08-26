import { describe, it, expect, beforeEach } from "vitest";
import { iRVI } from "../../src/ta/rvi";
import { InMemoryIndicatorEngine } from "../../src/libs/domain/indicator";
import { InMemoryMarketData } from "../../src/libs/domain/marketData";
import type { ExecutionContext } from "../../src/libs/domain/types";
import type { Candle } from "../../src/libs/domain/marketData";

describe("iRVI", () => {
  let context: ExecutionContext;
  let candles: Candle[];
  beforeEach(() => {
    candles = Array.from({ length: 7 }).map((_, i) => {
      const open = 1 + i * 0.05;
      return {
        time: i * 1000,
        open,
        high: open + 0.1,
        low: open - 0.04,
        close: open + 0.02,
        volume: 1000 + i * 100,
      };
    });
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

  it("calculates RVI", () => {
    const res = iRVI(context, "GBPUSD", 15, 3, 0, 0);
    expect(res).toBeCloseTo(0.142857, 4);
  });

  it("uses indicator cache", () => {
    const engine = context.indicatorEngine! as InMemoryIndicatorEngine;
    const key = { type: "iRVI", symbol: "GBPUSD", timeframe: 15, params: { period: 3 } } as const;
    iRVI(context, "GBPUSD", 15, 3, 0, 0);
    const state = engine.peek<any>(key)!;
    expect(state.last).toBe(candles.length - 1);
    iRVI(context, "GBPUSD", 15, 3, 0, 1);
    const again = engine.peek<any>(key)!;
    expect(again).toBe(state);
  });
});

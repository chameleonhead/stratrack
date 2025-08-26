import { describe, it, expect, beforeEach } from "vitest";
import { iAD } from "../../src/ta/ad";
import { InMemoryIndicatorEngine } from "../../src/libs/domain/indicator";
import { InMemoryMarketData } from "../../src/libs/domain/marketData";
import type { ExecutionContext } from "../../src/libs/domain/types";
import type { Candle } from "../../src/libs/domain/marketData";

describe("iAD", () => {
  let context: ExecutionContext;
  let candles: Candle[];
  beforeEach(() => {
    candles = [
      { time: 1, open: 10, high: 14, low: 9, close: 13, volume: 1000 },
      { time: 2, open: 13, high: 15, low: 10, close: 11, volume: 1000 },
      { time: 3, open: 11, high: 12, low: 8, close: 9, volume: 1000 },
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

  it("computes accumulation distribution", () => {
    const res = iAD(context, "GBPUSD", 15, 0);
    expect(res).toBe(-500);
  });

  it("uses indicator cache", () => {
    const engine = context.indicatorEngine! as InMemoryIndicatorEngine;
    const key = { type: "iAD", symbol: "GBPUSD", timeframe: 15 } as const;
    iAD(context, "GBPUSD", 15, 0);
    const state = engine.peek<any>(key)!;
    expect(state.last).toBe(candles.length - 1);
    iAD(context, "GBPUSD", 15, 1);
    const again = engine.peek<any>(key)!;
    expect(again).toBe(state);
  });
});

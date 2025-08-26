import { describe, it, expect, beforeEach } from "vitest";
import { iFractals } from "../../src/ta/fractals";
import { InMemoryIndicatorEngine } from "../../src/libs/domain/indicator";
import { InMemoryMarketData } from "../../src/libs/domain/marketData";
import type { ExecutionContext } from "../../src/libs/domain/types";
import type { Candle } from "../../src/libs/domain/marketData";

describe("iFractals", () => {
  let context: ExecutionContext;
  let candles: Candle[];
  beforeEach(() => {
    candles = [
      { time: 1000, open: 1.0, high: 1.1, low: 0.9, close: 1.05, volume: 1000 },
      { time: 2000, open: 1.05, high: 1.15, low: 1.0, close: 1.1, volume: 1100 },
      { time: 3000, open: 1.1, high: 1.3, low: 1.05, close: 1.2, volume: 1200 },
      { time: 4000, open: 1.2, high: 1.25, low: 0.95, close: 1.1, volume: 1300 },
      { time: 5000, open: 1.1, high: 1.2, low: 1.0, close: 1.15, volume: 1400 },
      { time: 6000, open: 1.15, high: 1.22, low: 1.05, close: 1.18, volume: 1500 },
      { time: 7000, open: 1.18, high: 1.24, low: 1.1, close: 1.2, volume: 1600 },
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

  it("detects fractals", () => {
    const up = iFractals(context, "GBPUSD", 15, 0, 4);
    const down = iFractals(context, "GBPUSD", 15, 1, 3);
    expect(up).toBeCloseTo(1.3, 4);
    expect(down).toBeCloseTo(0.95, 4);
  });

  it("uses indicator cache", () => {
    const engine = context.indicatorEngine! as InMemoryIndicatorEngine;
    const key = { type: "iFractals", symbol: "GBPUSD", timeframe: 15 } as const;
    iFractals(context, "GBPUSD", 15, 0, 4);
    const state = engine.peek<any>(key)!;
    expect(state.last).toBe(candles.length - 3);
    iFractals(context, "GBPUSD", 15, 1, 3);
    const again = engine.peek<any>(key)!;
    expect(again).toBe(state);
  });
});

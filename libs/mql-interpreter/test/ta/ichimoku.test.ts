import { describe, it, expect, beforeEach } from "vitest";
import { iIchimoku } from "../../src/ta/ichimoku";
import { InMemoryIndicatorEngine } from "../../src/libs/domain/indicator";
import { InMemoryMarketData } from "../../src/libs/domain/marketData";
import type { ExecutionContext } from "../../src/libs/domain/types";
import type { Candle } from "../../src/libs/domain/marketData";

describe("iIchimoku", () => {
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

  it("calculates ichimoku components", () => {
    const tenkan = iIchimoku(context, "GBPUSD", 15, 3, 4, 5, 0, 0);
    const kijun = iIchimoku(context, "GBPUSD", 15, 3, 4, 5, 1, 0);
    const spanA = iIchimoku(context, "GBPUSD", 15, 3, 4, 5, 2, 0);
    const spanB = iIchimoku(context, "GBPUSD", 15, 3, 4, 5, 3, 0);
    const chikou = iIchimoku(context, "GBPUSD", 15, 3, 4, 5, 4, 4);
    expect(tenkan).toBeCloseTo(1.175, 6);
    expect(kijun).toBeCloseTo(1.15, 6);
    expect(spanA).toBeCloseTo(1.1625, 6);
    expect(spanB).toBeCloseTo(1.1, 6);
    expect(chikou).toBeCloseTo(1.25, 6);
  });

  it("uses indicator cache", () => {
    const engine = context.indicatorEngine! as InMemoryIndicatorEngine;
    const key = {
      type: "iIchimoku",
      symbol: "GBPUSD",
      timeframe: 15,
      params: { tenkan: 3, kijun: 4, senkouSpanB: 5 },
    } as const;
    iIchimoku(context, "GBPUSD", 15, 3, 4, 5, 0, 0);
    const state = engine.peek<any>(key)!;
    expect(state.last).toBe(candles.length - 1);
    iIchimoku(context, "GBPUSD", 15, 3, 4, 5, 1, 0);
    const again = engine.peek<any>(key)!;
    expect(again).toBe(state);
  });
});

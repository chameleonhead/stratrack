import { BacktestRunner } from "../../../src/libs/backtestRunner";
import { callFunction } from "../../../src/runtime/runtime";
import { getContext } from "../../../src/libs/functions/context";
import type { IndicatorKey } from "../../../src/libs/indicatorCache";
import { describe, it, expect } from "vitest";

describe("indicator cache", () => {
  it("caches iMA calculations", () => {
    const code = "void OnTick(){return;}";
    const candles = [
      { time: 1, open: 1, high: 1, low: 1, close: 2 },
      { time: 2, open: 1, high: 1, low: 1, close: 4 },
      { time: 3, open: 1, high: 1, low: 1, close: 6 },
    ];
    const runner = new BacktestRunner(code, candles);
    runner.step();
    runner.step();
    const rt = runner.getRuntime();
    const cache = getContext().indicators!;
    const key: IndicatorKey = {
      type: "iMA",
      symbol: "TEST",
      timeframe: 0,
      params: { period: 2, maMethod: 0, applied: 0 },
    };
    callFunction(rt, "iMA", ["TEST", 0, 2, 0, 0, 0, 0]);
    const first = cache.peek<any>(key)!;
    callFunction(rt, "iMA", ["TEST", 0, 2, 1, 0, 0, 0]);
    const second = cache.peek<any>(key)!;
    expect(second.last).toBe(first.last);
  });

  it("caches iMACD calculations across modes", () => {
    const code = "void OnTick(){return;}";
    const candles = [
      { time: 1, open: 1, high: 1, low: 1, close: 1 },
      { time: 2, open: 1, high: 1, low: 1, close: 2 },
      { time: 3, open: 1, high: 1, low: 1, close: 3 },
      { time: 4, open: 1, high: 1, low: 1, close: 4 },
      { time: 5, open: 1, high: 1, low: 1, close: 5 },
    ];
    const runner = new BacktestRunner(code, candles);
    for (let i = 0; i < 4; i++) runner.step();
    const rt = runner.getRuntime();
    const cache = getContext().indicators!;
    const key: IndicatorKey = {
      type: "iMACD",
      symbol: "TEST",
      timeframe: 0,
      params: { fast: 2, slow: 3, signal: 2, applied: 0 },
    };
    callFunction(rt, "iMACD", ["TEST", 0, 2, 3, 2, 0, 0, 0]);
    const first = cache.peek<any>(key)!;
    callFunction(rt, "iMACD", ["TEST", 0, 2, 3, 2, 0, 1, 0]);
    const second = cache.peek<any>(key)!;
    expect(second.last).toBe(first.last);
  });

  it("caches iATR calculations", () => {
    const code = "void OnTick(){return;}";
    const candles = [
      { time: 1, open: 1, high: 2, low: 0.5, close: 1 },
      { time: 2, open: 1, high: 3, low: 0.5, close: 2 },
      { time: 3, open: 2, high: 4, low: 1.5, close: 3 },
    ];
    const runner = new BacktestRunner(code, candles);
    runner.step();
    runner.step();
    const rt = runner.getRuntime();
    const cache = getContext().indicators!;
    const key: IndicatorKey = {
      type: "iATR",
      symbol: "TEST",
      timeframe: 0,
      params: { period: 2 },
    };
    callFunction(rt, "iATR", ["TEST", 0, 2, 0]);
    const first = cache.peek<any>(key)!;
    callFunction(rt, "iATR", ["TEST", 0, 2, 1]);
    const second = cache.peek<any>(key)!;
    expect(second.last).toBe(first.last);
  });

  it("caches iRSI calculations", () => {
    const code = "void OnTick(){return;}";
    const candles = [
      { time: 1, open: 1, high: 1, low: 1, close: 1 },
      { time: 2, open: 1, high: 1, low: 1, close: 2 },
      { time: 3, open: 1, high: 1, low: 1, close: 1 },
      { time: 4, open: 1, high: 1, low: 1, close: 2 },
    ];
    const runner = new BacktestRunner(code, candles);
    runner.step();
    runner.step();
    runner.step();
    const rt = runner.getRuntime();
    const cache = getContext().indicators!;
    const key: IndicatorKey = {
      type: "iRSI",
      symbol: "TEST",
      timeframe: 0,
      params: { period: 2, applied: 0 },
    };
    callFunction(rt, "iRSI", ["TEST", 0, 2, 0, 0]);
    const first = cache.peek<any>(key)!;
    callFunction(rt, "iRSI", ["TEST", 0, 2, 0, 1]);
    const second = cache.peek<any>(key)!;
    expect(second.last).toBe(first.last);
  });
});

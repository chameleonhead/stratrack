import { BacktestRunner } from "../../src/core/runtime/backtest";
import { callFunction } from "../../src/core/runtime";
import { describe, it, expect } from "vitest";

describe("series builtins", () => {
  it("provides bar data and copy helpers", () => {
    const code = "void OnTick(){ return; }";
    const candles = [
      { time: 1, open: 1, high: 2, low: 0, close: 1, volume: 10 },
      { time: 2, open: 1.1, high: 2.1, low: 0.1, close: 1.2, volume: 11 },
    ];
    const runner = new BacktestRunner(code, candles);
    const rt = runner.getRuntime();
    expect(callFunction(rt, "Bars", ["TEST", 0])).toBe(2);
    expect(callFunction(rt, "iBarShift", ["TEST", 0, 1, true])).toBe(0);
    const arr: number[] = [];
    callFunction(rt, "CopyOpen", ["TEST", 0, 0, 2, arr]);
    expect(arr[1]).toBeCloseTo(1.1);
  });

  it("returns individual bar values", () => {
    const code = "void OnTick(){ return; }";
    const candles = [
      { time: 1, open: 1, high: 2, low: 0, close: 1, volume: 10 },
      { time: 2, open: 1.1, high: 2.1, low: 0.1, close: 1.2, volume: 11 },
    ];
    const runner = new BacktestRunner(code, candles);
    const rt = runner.getRuntime();
    runner.step();
    expect(callFunction(rt, "iOpen", ["TEST", 0, 0])).toBeCloseTo(1.1);
    expect(callFunction(rt, "iClose", ["TEST", 0, 0])).toBeCloseTo(1.2);
    expect(callFunction(rt, "iTime", ["TEST", 0, 0])).toBe(2);
    expect(callFunction(rt, "iVolume", ["TEST", 0, 1])).toBe(10);
  });

  it("supports CopyRates and SeriesInfoInteger", () => {
    const code = "void OnTick(){ return; }";
    const candles = [
      { time: 1, open: 1, high: 2, low: 0, close: 1, volume: 10 },
      { time: 2, open: 1.1, high: 2.1, low: 0.1, close: 1.2, volume: 11 },
    ];
    const runner = new BacktestRunner(code, candles);
    const rt = runner.getRuntime();
    const dst: any[] = [];
    const copied = callFunction(rt, "CopyRates", ["TEST", 0, 0, 2, dst]);
    expect(copied).toBe(2);
    expect(dst[1].close).toBeCloseTo(1.2);
    expect(callFunction(rt, "SeriesInfoInteger", ["TEST", 0, 0])).toBe(2);
    expect(callFunction(rt, "RefreshRates", [])).toBe(1);
  });
});

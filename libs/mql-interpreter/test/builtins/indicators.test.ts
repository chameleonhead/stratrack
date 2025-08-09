import { BacktestRunner } from "../../src/backtest";
import { callFunction } from "../../src/runtime";
import { describe, it, expect } from "vitest";

describe("indicator builtins", () => {
  it("calculates simple moving average", () => {
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
    const val = callFunction(rt, "iMA", ["TEST", 0, 2, 0, 0, 0, 0]);
    expect(val).toBeCloseTo((4 + 6) / 2);
  });

  it("calculates RSI", () => {
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
    const val = callFunction(rt, "iRSI", ["TEST", 0, 2, 0, 0]);
    expect(val).toBeCloseTo(50);
  });

  it("calculates ATR", () => {
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
    const val = callFunction(rt, "iATR", ["TEST", 0, 2, 0]);
    expect(val).toBeCloseTo(2.5);
  });

  it("calculates MACD main and signal", () => {
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
    const macd = callFunction(rt, "iMACD", ["TEST", 0, 2, 3, 2, 0, 0, 0]);
    const signal = callFunction(rt, "iMACD", ["TEST", 0, 2, 3, 2, 0, 1, 0]);
    expect(macd).toBeCloseTo(0.44367, 4);
    expect(signal).toBeCloseTo(0.40997, 4);
  });

  it("binds indicator buffers", () => {
    const code = "void OnTick(){return;}";
    const candles = [{ time: 1, open: 1, high: 1, low: 1, close: 1 }];
    const runner = new BacktestRunner(code, candles);
    const rt = runner.getRuntime();
    const buf: number[] = [];
    callFunction(rt, "IndicatorBuffers", [1]);
    expect(rt.globalValues._IndicatorBuffers.length).toBe(1);
    callFunction(rt, "SetIndexBuffer", [0, buf]);
    expect(rt.globalValues._IndicatorBuffers[0]).toBe(buf);
  });

  it("sets index label and shift", () => {
    const code = "void OnTick(){return;}";
    const candles = [{ time: 1, open: 1, high: 1, low: 1, close: 1 }];
    const runner = new BacktestRunner(code, candles);
    const rt = runner.getRuntime();
    callFunction(rt, "IndicatorBuffers", [2]);
    callFunction(rt, "SetIndexLabel", [0, "main"]);
    callFunction(rt, "SetIndexShift", [1, 3]);
    expect(rt.globalValues._IndicatorLabels[0]).toBe("main");
    expect(rt.globalValues._IndicatorShifts[1]).toBe(3);
  });
});

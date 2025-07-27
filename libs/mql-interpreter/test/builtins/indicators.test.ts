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
});

import { BacktestRunner } from "../../src/backtest";
import { callFunction } from "../../src/runtime";
import { describe, it, expect } from "vitest";

describe("account builtins", () => {
  it("provide balance, equity and profit", () => {
    const code = "void OnTick(){ return; }";
    const candles = [
      { time: 1, open: 1, high: 1, low: 1, close: 1 },
      { time: 2, open: 2, high: 2, low: 2, close: 2 },
    ];
    const runner = new BacktestRunner(code, candles, { initialBalance: 100 });
    runner.step();
    callFunction(runner.getRuntime(), "OrderSend", ["", 0, 1, 0, 0, 0, 0]);
    runner.run();
    const rt = runner.getRuntime();
    expect(callFunction(rt, "AccountBalance")).toBeCloseTo(100);
    expect(callFunction(rt, "AccountEquity")).toBeCloseTo(101);
    expect(callFunction(rt, "AccountProfit")).toBeCloseTo(1);
  });
});

import { BacktestRunner } from "../../src/runtime/backtest";
import { callFunction } from "../../src/runtime";
import { describe, it, expect } from "vitest";

describe("trading builtins", () => {
  it("enumerates and selects orders", () => {
    const code = "void OnTick(){ return; }";
    const candles = [
      { time: 1, open: 1, high: 1, low: 1, close: 1 },
      { time: 2, open: 2, high: 2, low: 2, close: 2 },
    ];
    const runner = new BacktestRunner(code, candles);
    const rt = runner.getRuntime();
    callFunction(rt, "OrderSend", ["EURUSD", 0, 1, 0, 0, 0, 0]);
    expect(callFunction(rt, "OrdersTotal")).toBe(1);
    expect(callFunction(rt, "OrderSelect", [0, 0, 0])).toBe(1);
    expect(callFunction(rt, "OrderType")).toBe(0);
    expect(callFunction(rt, "OrderTicket")).toBe(0);
  });

  it("closes orders and moves to history", () => {
    const code = "void OnTick(){ return; }";
    const candles = [
      { time: 1, open: 1, high: 1, low: 1, close: 1 },
      { time: 2, open: 2, high: 2, low: 2, close: 2 },
    ];
    const runner = new BacktestRunner(code, candles);
    const rt = runner.getRuntime();
    callFunction(rt, "OrderSend", ["EURUSD", 0, 1, 0, 0, 0, 0]);
    runner.step();
    expect(callFunction(rt, "OrderClose", [0, 1, 1.5])).toBe(1);
    expect(callFunction(rt, "OrdersTotal")).toBe(0);
    expect(callFunction(rt, "OrdersHistoryTotal")).toBe(1);
  });
});

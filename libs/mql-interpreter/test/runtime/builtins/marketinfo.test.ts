import { BacktestRunner } from "../../../src/libs/backtestRunner";
import { callFunction } from "../../../src/runtime/runtime";
import { describe, it, expect } from "vitest";

describe("market information builtins", () => {
  it("returns bid and ask from tick data", () => {
    const code = "void OnTick(){ return; }";
    const candles = [
      { time: 1, open: 1, high: 1, low: 1, close: 1 },
      { time: 2, open: 2, high: 2, low: 2, close: 2 },
    ];
    const ticks = {
      EURUSD: [
        { time: 1, bid: 1.0, ask: 1.1 },
        { time: 2, bid: 2.0, ask: 2.1 },
      ],
    };
    const runner = new BacktestRunner(code, candles, { ticks, symbol: "EURUSD" });
    const rt = runner.getRuntime();
    expect(callFunction(rt, "MarketInfo", ["EURUSD", 9])).toBeCloseTo(1.0);
    expect(callFunction(rt, "MarketInfo", ["EURUSD", 10])).toBeCloseTo(1.1);
    runner.step();
    expect(callFunction(rt, "MarketInfo", ["EURUSD", 9])).toBeCloseTo(2.0);
    expect(callFunction(rt, "MarketInfo", ["EURUSD", 10])).toBeCloseTo(2.1);
  });

  it("provides symbol lists", () => {
    const code = "void OnTick(){}";
    const runner = new BacktestRunner(code, [], {
      ticks: { EURUSD: [], USDJPY: [] },
      symbol: "EURUSD",
    });
    const rt = runner.getRuntime();
    expect(callFunction(rt, "SymbolsTotal", [false])).toBe(2);
    expect(callFunction(rt, "SymbolName", [1, false])).toBe("USDJPY");
  });
});

import { BacktestRunner, ticksToCandles } from "../src/core/runtime/backtest";
import { callFunction } from "../src/core/runtime";
import { describe, it, expect } from "vitest";

describe("BacktestRunner", () => {
  it("runs entry point for each candle", () => {
    const code = "int count; void OnTick(){ count++; }";
    const candles = [
      { time: 1, open: 1, high: 1, low: 1, close: 1 },
      { time: 2, open: 2, high: 2, low: 2, close: 2 },
      { time: 3, open: 3, high: 3, low: 3, close: 3 },
    ];
    const runner = new BacktestRunner(code, candles);
    runner.run();
    expect(runner.getRuntime().globalValues.count).toBe(3);
  });
  it("fires OnTimer at scheduled intervals", () => {
    const code = `int ticks=0, timers=0;\nvoid OnInit(){EventSetTimer(1);}\nvoid OnTick(){ticks++;}\nvoid OnTimer(){timers++;}`;
    const candles = [
      { time: 0, open: 1, high: 1, low: 1, close: 1 },
      { time: 1, open: 1, high: 1, low: 1, close: 1 },
      { time: 2, open: 1, high: 1, low: 1, close: 1 },
      { time: 3, open: 1, high: 1, low: 1, close: 1 },
    ];
    const runner = new BacktestRunner(code, candles);
    runner.run();
    const gv = runner.getRuntime().globalValues;
    expect(gv.ticks).toBe(4);
    expect(gv.timers).toBe(3);
  });
  it("fires OnTimer using millisecond timer", () => {
    const code = `int ticks=0, timers=0;\nvoid OnInit(){EventSetMillisecondTimer(1500);}\nvoid OnTick(){ticks++;}\nvoid OnTimer(){timers++;}`;
    const candles = [
      { time: 0, open: 1, high: 1, low: 1, close: 1 },
      { time: 1, open: 1, high: 1, low: 1, close: 1 },
      { time: 2, open: 1, high: 1, low: 1, close: 1 },
      { time: 3, open: 1, high: 1, low: 1, close: 1 },
      { time: 4, open: 1, high: 1, low: 1, close: 1 },
    ];
    const runner = new BacktestRunner(code, candles);
    runner.run();
    const gv = runner.getRuntime().globalValues;
    expect(gv.ticks).toBe(5);
    expect(gv.timers).toBe(2);
  });
  it("fires multiple OnTimer events when step spans intervals", () => {
    const code = `int timers=0;\nvoid OnInit(){EventSetTimer(1);}\nvoid OnTick(){return;}\nvoid OnTimer(){timers++;}`;
    const candles = [
      { time: 0, open: 1, high: 1, low: 1, close: 1 },
      { time: 3, open: 1, high: 1, low: 1, close: 1 },
    ];
    const runner = new BacktestRunner(code, candles);
    runner.run();
    const gv = runner.getRuntime().globalValues;
    expect(gv.timers).toBe(3);
  });
  it("executes scripts via OnStart once", () => {
    const code = "int s; void OnStart(){ s++; }";
    const candles = [
      { time: 1, open: 1, high: 1, low: 1, close: 1 },
      { time: 2, open: 2, high: 2, low: 2, close: 2 },
    ];
    const runner = new BacktestRunner(code, candles);
    runner.run();
    expect(runner.getRuntime().globalValues.s).toBe(1);
  });
  it("provides price data through builtins", () => {
    const code = "void OnTick(){return;}";
    const candles = [
      { time: 1, open: 1, high: 1, low: 1, close: 123 },
      { time: 2, open: 2, high: 2, low: 2, close: 456 },
    ];
    const runner = new BacktestRunner(code, candles);
    const rt = runner.getRuntime();
    const val1 = callFunction(rt, "iClose", ["", 0, 0]);
    expect(val1).toBe(123);
    runner.step();
    const val2 = callFunction(rt, "iClose", ["", 0, 0]);
    expect(val2).toBe(456);
    expect(rt.globalValues.Open[0]).toBe(1);
    expect(rt.globalValues.Close[1]).toBe(456);
  });

  it("updates Bid/Ask and records market orders", () => {
    const code = "void OnTick(){ return; }";
    const candles = [
      { time: 10, open: 1, high: 1, low: 1, close: 1 },
      { time: 20, open: 2, high: 2, low: 2, close: 2 },
    ];
    const runner = new BacktestRunner(code, candles);
    runner.step();
    expect(runner.getRuntime().globalValues.Bid).toBe(1);
    callFunction(runner.getRuntime(), "OrderSend", ["", 0, 1, 0, 0, 0, 0]);
    const orders = runner.getBroker().getOpenOrders();
    expect(orders.length).toBe(1);
    expect(orders[0].state).toBe("open");
    expect(orders[0].price).toBe(1);
  });

  it("triggers limit orders and tp/sl automatically", () => {
    const code = "void OnTick(){ return; }";
    const candles = [
      { time: 10, open: 1, high: 1, low: 1, close: 1 },
      { time: 20, open: 2, high: 2, low: 0.5, close: 1.5 },
      { time: 30, open: 3, high: 3, low: 1.4, close: 3 },
    ];
    const runner = new BacktestRunner(code, candles);
    // place buy limit at 1.2 with tp 2 and sl 0.8
    callFunction(runner.getRuntime(), "OrderSend", ["", 2, 1, 1.2, 0, 0.8, 2]);
    // first step should not open yet
    runner.step();
    expect(runner.getBroker().getActiveOrders()[0].state).toBe("pending");
    // second candle hits limit price and also TP
    runner.step();
    const history = runner.getBroker().getHistory();
    expect(history.length).toBe(1);
    expect(history[0].profit).toBeCloseTo(0.8); // 2 - 1.2
  });

  it("modifies stop loss and take profit", () => {
    const code = "void OnTick(){ return; }";
    const candles = [
      { time: 10, open: 1, high: 1.1, low: 1, close: 1 },
      { time: 20, open: 1, high: 1.2, low: 0.7, close: 1 },
    ];
    const runner = new BacktestRunner(code, candles);
    runner.step();
    const rt = runner.getRuntime();
    callFunction(rt, "OrderSend", ["", 0, 1, 0, 0, 0, 0]);
    expect(runner.getBroker().getOpenOrders()[0].sl).toBeUndefined();
    callFunction(rt, "OrderModify", [0, 0, 0.8, 0, 0, 0]);
    expect(runner.getBroker().getOpenOrders()[0].sl).toBe(0.8);
    runner.step();
    const history = runner.getBroker().getHistory();
    expect(history.length).toBe(1);
    expect(history[0].closePrice).toBe(0.8);
  });

  it("fires OnTrade for order operations", () => {
    const code = `int trades=0;\nvoid OnTick(){int t=OrderSend("",0,1,0,0,0,0);OrderClose(t,1,0);}\nvoid OnTrade(){trades++;}`;
    const candles = [{ time: 1, open: 1, high: 1, low: 1, close: 1 }];
    const runner = new BacktestRunner(code, candles);
    runner.step();
    expect(runner.getRuntime().globalValues.trades).toBe(2);
  });

  it("fires OnTrade when orders open and close automatically", () => {
    const code = `int trades=0;int placed=0;\nvoid OnTick(){if(placed==0){OrderSend("",2,1,0.9,0,0,2.0);placed=1;}}\nvoid OnTrade(){trades++;}`;
    const candles = [
      { time: 1, open: 1, high: 1, low: 1, close: 1 },
      { time: 2, open: 1, high: 1.1, low: 0.8, close: 1.05 },
      { time: 3, open: 1.05, high: 2.1, low: 1, close: 2 },
    ];
    const runner = new BacktestRunner(code, candles);
    runner.step();
    runner.step();
    runner.step();
    expect(runner.getRuntime().globalValues.trades).toBe(3);
  });

  it("provides order context to OnTrade handlers", () => {
    const code = `int calls=0;\nvoid OnTick(){int t=OrderSend("",0,1,0,0,0,0);OrderClose(t,1,0);}\nvoid OnTrade(){calls++;}`;
    const candles = [{ time: 1, open: 1, high: 1, low: 1, close: 1 }];
    const runner = new BacktestRunner(code, candles);
    runner.step();
    expect(runner.getRuntime().globalValues.calls).toBe(2);
    expect(runner.getRuntime().tradeContext).toEqual({ ticket: 0, type: "buy" });
  });

  it("fires OnChartEvent when events are queued", () => {
    const code = `int events=0;\nvoid OnChartEvent(int id,long l,double d,string s){events++;}\nvoid OnTick(){events+=0;}`;
    const candles = [{ time: 1, open: 1, high: 1, low: 1, close: 1 }];
    const runner = new BacktestRunner(code, candles);
    callFunction(runner.getRuntime(), "EventChartCustom", [1, 2, 3.5, "x"]);
    runner.step();
    expect(runner.getRuntime().globalValues.events).toBe(1);
  });

  it("converts ticks to candles", () => {
    const ticks = [
      { time: 0, bid: 1, ask: 1 },
      { time: 30, bid: 2, ask: 2 },
      { time: 61, bid: 3, ask: 3 },
    ];
    const candles = ticksToCandles(ticks, 60);
    expect(candles.length).toBe(2);
    expect(candles[0]).toEqual({ time: 0, open: 1, high: 2, low: 1, close: 2 });
    expect(candles[1]).toEqual({ time: 60, open: 3, high: 3, low: 3, close: 3 });
  });

  it("provides account metrics", () => {
    const code = "void OnTick(){ return; }";
    const candles = [
      { time: 1, open: 1, high: 1, low: 1, close: 1 },
      { time: 2, open: 2, high: 2, low: 2, close: 2 },
    ];
    const runner = new BacktestRunner(code, candles);
    runner.step();
    callFunction(runner.getRuntime(), "OrderSend", ["", 0, 1, 0, 0, 0, 0]);
    runner.run();
    const metrics = runner.getAccountMetrics();
    expect(metrics.openProfit).toBe(1);
    expect(metrics.equity).toBe(10001);
  });

  it("initializes predefined variables and ResetLastError", () => {
    const code = "void OnTick(){ ResetLastError(); }";
    const candles = [{ time: 1, open: 1, high: 1, low: 1, close: 1 }];
    const runner = new BacktestRunner(code, candles);
    const rt = runner.getRuntime();
    expect(rt.globalValues._Digits).toBe(5);
    rt.globalValues._LastError = 5;
    callFunction(rt, "ResetLastError");
    expect(rt.globalValues._LastError).toBe(0);
  });

  it("exposes GetLastError and IsStopped", () => {
    const code = "void OnTick(){ return; }";
    const candles = [{ time: 1, open: 1, high: 1, low: 1, close: 1 }];
    const runner = new BacktestRunner(code, candles);
    const rt = runner.getRuntime();
    rt.globalValues._LastError = 7;
    expect(callFunction(rt, "GetLastError", [])).toBe(7);
    rt.globalValues._StopFlag = 1;
    expect(callFunction(rt, "IsStopped", [])).toBe(1);
  });

  it("provides Symbol, Period and testing state", () => {
    const code = "void OnTick(){return;}";
    const candles = [
      { time: 1, open: 1, high: 1, low: 1, close: 1 },
      { time: 2, open: 2, high: 2, low: 2, close: 2 },
    ];
    const runner = new BacktestRunner(code, candles, { symbol: "EURUSD" });
    const rt = runner.getRuntime();
    expect(callFunction(rt, "Symbol")).toBe("EURUSD");
    expect(callFunction(rt, "Period")).toBe(candles[1].time - candles[0].time);
    expect(callFunction(rt, "IsTesting")).toBe(true);
  });
  it("runs OnInit and OnDeinit automatically", () => {
    const code =
      "int init; int deinit; void OnInit(){init++;} void OnDeinit(){deinit++;} void OnTick(){return;}";
    const candles = [{ time: 1, open: 1, high: 1, low: 1, close: 1 }];
    const runner = new BacktestRunner(code, candles);
    runner.run();
    const gv = runner.getRuntime().globalValues;
    expect(gv.init).toBe(1);
    expect(gv.deinit).toBe(1);
  });

  it("provides a backtest report", () => {
    const code = "void OnTick(){return;}";
    const candles = [{ time: 1, open: 1, high: 1, low: 1, close: 1 }];
    const runner = new BacktestRunner(code, candles);
    runner.run();
    const report = runner.getReport();
    expect(report.globals.Bars).toBe(1);
    expect(report.metrics.balance).toBe(10000);
    expect(report.orders.length).toBe(0);
  });

  it("reproduces first trade on M15 timeframe", () => {
    const code = "void OnTick(){return;}";
    const candles = [
      { time: 0, open: 1.34636, high: 1.34636, low: 1.34636, close: 1.34636 },
      { time: 900, open: 1.34636, high: 1.34686, low: 1.34636, close: 1.34686 },
    ];
    const runner = new BacktestRunner(code, candles, { symbol: "EURUSD" });
    runner.step();
    const rt = runner.getRuntime();
    callFunction(rt, "OrderSend", ["EURUSD", 0, 0.1, 0, 0, 0, 1.34686]);
    const order = runner.getBroker().getOpenOrders()[0];
    expect(order).toMatchObject({
      ticket: 0,
      type: "buy",
      volume: 0.1,
      price: 1.34636,
      tp: 1.34686,
      sl: undefined,
      state: "open",
    });
    expect(callFunction(rt, "Period")).toBe(900);
  });
});

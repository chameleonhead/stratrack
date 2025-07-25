import { BacktestRunner } from '../src/backtest';
import { callFunction } from '../src/runtime';
import { ticksToCandles } from '../src/backtest';
import { describe, it, expect } from 'vitest';

describe('BacktestRunner', () => {
  it('runs entry point for each candle', () => {
    const code = 'int count; void OnTick(){ count++; }';
    const candles = [
      { time: 1, open: 1, high: 1, low: 1, close: 1 },
      { time: 2, open: 2, high: 2, low: 2, close: 2 },
      { time: 3, open: 3, high: 3, low: 3, close: 3 },
    ];
    const runner = new BacktestRunner(code, candles);
    runner.run();
    expect(runner.getRuntime().globalValues.count).toBe(3);
  });
  it('provides price data through builtins', () => {
    const code = 'void OnTick(){return;}';
    const candles = [
      { time: 1, open: 1, high: 1, low: 1, close: 123 },
      { time: 2, open: 2, high: 2, low: 2, close: 456 },
    ];
    const runner = new BacktestRunner(code, candles);
    const rt = runner.getRuntime();
    const val1 = callFunction(rt, 'iClose', ['', 0, 0]);
    expect(val1).toBe(123);
    runner.step();
    const val2 = callFunction(rt, 'iClose', ['', 0, 0]);
    expect(val2).toBe(456);
    expect(rt.globalValues.Open[0]).toBe(1);
    expect(rt.globalValues.Close[1]).toBe(456);
  });

  it('updates Bid/Ask and records market orders', () => {
    const code = 'void OnTick(){ return; }';
    const candles = [
      { time: 10, open: 1, high: 1, low: 1, close: 1 },
      { time: 20, open: 2, high: 2, low: 2, close: 2 },
    ];
    const runner = new BacktestRunner(code, candles);
    runner.step();
    expect(runner.getRuntime().globalValues.Bid).toBe(1);
    callFunction(runner.getRuntime(), 'OrderSend', ['', 0, 1, 0, 0, 0, 0]);
    const orders = runner.getBroker().getOpenOrders();
    expect(orders.length).toBe(1);
    expect(orders[0].state).toBe('open');
    expect(orders[0].price).toBe(1);
  });

  it('triggers limit orders and tp/sl automatically', () => {
    const code = 'void OnTick(){ return; }';
    const candles = [
      { time: 10, open: 1, high: 1, low: 1, close: 1 },
      { time: 20, open: 2, high: 2, low: 0.5, close: 1.5 },
      { time: 30, open: 3, high: 3, low: 1.4, close: 3 },
    ];
    const runner = new BacktestRunner(code, candles);
    // place buy limit at 1.2 with tp 2 and sl 0.8
    callFunction(runner.getRuntime(), 'OrderSend', ['', 2, 1, 1.2, 0, 0.8, 2]);
    // first step should not open yet
    runner.step();
    expect(runner.getBroker().getActiveOrders()[0].state).toBe('pending');
    // second candle hits limit price and also TP
    runner.step();
    const history = runner.getBroker().getHistory();
    expect(history.length).toBe(1);
    expect(history[0].profit).toBeCloseTo(0.8); // 2 - 1.2
  });

  it('converts ticks to candles', () => {
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

  it('provides account metrics', () => {
    const code = 'void OnTick(){ return; }';
    const candles = [
      { time: 1, open: 1, high: 1, low: 1, close: 1 },
      { time: 2, open: 2, high: 2, low: 2, close: 2 },
    ];
    const runner = new BacktestRunner(code, candles);
    runner.step();
    callFunction(runner.getRuntime(), 'OrderSend', ['', 0, 1, 0, 0, 0, 0]);
    runner.run();
    const metrics = runner.getAccountMetrics();
    expect(metrics.openProfit).toBe(1);
    expect(metrics.equity).toBe(1);
  });

  it('initializes predefined variables and ResetLastError', () => {
    const code = 'void OnTick(){ ResetLastError(); }';
    const candles = [{ time: 1, open: 1, high: 1, low: 1, close: 1 }];
    const runner = new BacktestRunner(code, candles);
    const rt = runner.getRuntime();
    expect(rt.globalValues._Digits).toBe(5);
    rt.globalValues._LastError = 5;
    callFunction(rt, 'ResetLastError');
    expect(rt.globalValues._LastError).toBe(0);
  });

  it('exposes GetLastError and IsStopped', () => {
    const code = 'void OnTick(){ return; }';
    const candles = [{ time: 1, open: 1, high: 1, low: 1, close: 1 }];
    const runner = new BacktestRunner(code, candles);
    const rt = runner.getRuntime();
    rt.globalValues._LastError = 7;
    expect(callFunction(rt, 'GetLastError', [])).toBe(7);
    rt.globalValues._StopFlag = 1;
    expect(callFunction(rt, 'IsStopped', [])).toBe(1);
  });

  it('provides Symbol, Period and testing state', () => {
    const code = 'void OnTick(){}';
    const candles = [
      { time: 1, open: 1, high: 1, low: 1, close: 1 },
      { time: 2, open: 2, high: 2, low: 2, close: 2 },
    ];
    const runner = new BacktestRunner(code, candles, { symbol: 'EURUSD' });
    const rt = runner.getRuntime();
    expect(callFunction(rt, 'Symbol')).toBe('EURUSD');
    expect(callFunction(rt, 'Period')).toBe(candles[1].time - candles[0].time);
    expect(callFunction(rt, 'IsTesting')).toBe(true);
  });
});

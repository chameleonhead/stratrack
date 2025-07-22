import { BacktestRunner } from '../src/backtest';
import { callFunction } from '../src/runtime';
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
  });
});

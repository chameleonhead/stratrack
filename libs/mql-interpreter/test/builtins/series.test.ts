import { BacktestRunner } from '../../src/backtest';
import { callFunction } from '../../src/runtime';
import { describe, it, expect } from 'vitest';

describe('series builtins', () => {
  it('provides bar data and copy helpers', () => {
    const code = 'void OnTick(){}';
    const candles = [
      { time: 1, open: 1, high: 2, low: 0, close: 1, volume: 10 },
      { time: 2, open: 1.1, high: 2.1, low: 0.1, close: 1.2, volume: 11 },
    ];
    const runner = new BacktestRunner(code, candles);
    const rt = runner.getRuntime();
    expect(callFunction(rt, 'Bars', ['TEST', 0])).toBe(2);
    expect(callFunction(rt, 'iBarShift', ['TEST', 0, 1, true])).toBe(0);
    const arr: number[] = [];
    callFunction(rt, 'CopyOpen', ['TEST', 0, 0, 2, arr]);
    expect(arr[1]).toBeCloseTo(1.1);
  });
});

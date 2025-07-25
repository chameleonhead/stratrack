import { BacktestRunner } from '../../src/backtest';
import { callFunction } from '../../src/runtime';
import { describe, it, expect } from 'vitest';

describe('indicator builtins', () => {
  it('calculates simple moving average', () => {
    const code = 'void OnTick(){return;}';
    const candles = [
      { time: 1, open: 1, high: 1, low: 1, close: 2 },
      { time: 2, open: 1, high: 1, low: 1, close: 4 },
      { time: 3, open: 1, high: 1, low: 1, close: 6 },
    ];
    const runner = new BacktestRunner(code, candles);
    runner.step();
    runner.step();
    const rt = runner.getRuntime();
    const val = callFunction(rt, 'iMA', ['TEST', 0, 2, 0, 0, 0, 0]);
    expect(val).toBeCloseTo((4 + 6) / 2);
  });
});

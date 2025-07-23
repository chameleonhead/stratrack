import { compile, callFunction, Runtime, registerEnvBuiltins } from './index';
import type { PreprocessOptions } from './preprocess';
import type { BuiltinFunction } from './builtins';

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

/** Parse CSV formatted candle data. Each line should contain
 *  `time,open,high,low,close[,volume]` values.
 */
export function parseCsv(data: string): Candle[] {
  const lines = data.split(/\r?\n/).filter((l: string) => l.trim().length);
  const candles: Candle[] = [];
  for (const line of lines) {
    const [time, open, high, low, close, volume] = line.split(',');
    const candle: Candle = {
      time: Number(time),
      open: Number(open),
      high: Number(high),
      low: Number(low),
      close: Number(close),
    };
    if (volume !== undefined) candle.volume = Number(volume);
    candles.push(candle);
  }
  return candles;
}

export interface BacktestOptions {
  entryPoint?: string;
  preprocessOptions?: PreprocessOptions;
}

export class BacktestRunner {
  private runtime: Runtime;
  private index = 0;
  constructor(
    private source: string,
    private candles: Candle[],
    private options: BacktestOptions = {},
  ) {
    const compilation = compile(source, options.preprocessOptions);
    if (compilation.errors.length) {
      const msg = compilation.errors.map((e) => `${e.line}:${e.column} ${e.message}`).join('\n');
      throw new Error(`Compilation failed:\n${msg}`);
    }
    this.runtime = compilation.runtime;
    const builtins = this.buildBuiltins();
    registerEnvBuiltins(builtins);
  }

  private buildBuiltins(): Record<string, BuiltinFunction> {
    return {
      iOpen: (_symbol: any, _tf: any, shift: number) => {
        const c = this.candles[this.index - (shift ?? 0)];
        return c ? c.open : 0;
      },
      iHigh: (_symbol: any, _tf: any, shift: number) => {
        const c = this.candles[this.index - (shift ?? 0)];
        return c ? c.high : 0;
      },
      iLow: (_symbol: any, _tf: any, shift: number) => {
        const c = this.candles[this.index - (shift ?? 0)];
        return c ? c.low : 0;
      },
      iClose: (_symbol: any, _tf: any, shift: number) => {
        const c = this.candles[this.index - (shift ?? 0)];
        return c ? c.close : 0;
      },
      iTime: (_symbol: any, _tf: any, shift: number) => {
        const c = this.candles[this.index - (shift ?? 0)];
        return c ? c.time : 0;
      },
    };
  }

  step(): void {
    const entry = this.options.entryPoint || 'OnTick';
    if (this.index >= this.candles.length) return;
    callFunction(this.runtime, entry);
    this.index++;
  }

  run(): void {
    while (this.index < this.candles.length) {
      this.step();
    }
  }

  getRuntime(): Runtime {
    return this.runtime;
  }
}


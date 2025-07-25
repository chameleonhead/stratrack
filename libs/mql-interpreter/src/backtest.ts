import { compile, callFunction, Runtime, registerEnvBuiltins } from './index';
import type { PreprocessOptions } from './preprocess';
import type { BuiltinFunction } from './builtins';
import { Broker } from './broker';

export interface Tick {
  time: number;
  bid: number;
  ask: number;
}

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

/** Convert a sequence of ticks into candles. `timeframe` specifies the duration
 *  of each candle in the same units as tick timestamps. */
export function ticksToCandles(ticks: Tick[], timeframe: number): Candle[] {
  if (!ticks.length) return [];
  const sorted = [...ticks].sort((a, b) => a.time - b.time);
  const candles: Candle[] = [];
  const mid = (t: Tick) => (t.bid + t.ask) / 2;
  let start = Math.floor(sorted[0].time / timeframe) * timeframe;
  let open = mid(sorted[0]);
  let high = open;
  let low = open;
  for (let i = 0; i < sorted.length; i++) {
    const t = sorted[i];
    const price = mid(t);
    const bucket = Math.floor(t.time / timeframe) * timeframe;
    if (bucket !== start) {
      const prev = sorted[i - 1];
      candles.push({ time: start, open, high, low, close: mid(prev) });
      start = bucket;
      open = price;
      high = price;
      low = price;
    } else {
      if (price > high) high = price;
      if (price < low) low = price;
    }
  }
  const last = sorted[sorted.length - 1];
  candles.push({ time: start, open, high, low, close: mid(last) });
  return candles;
}

export interface BacktestOptions {
  entryPoint?: string;
  preprocessOptions?: PreprocessOptions;
}

export class BacktestRunner {
  private runtime: Runtime;
  private index = 0;
  private broker = new Broker();
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
    this.initializeGlobals();
    const builtins = this.buildBuiltins();
    registerEnvBuiltins(builtins);
  }

  private initializeGlobals(): void {
    const rt = this.runtime.globalValues;
    rt.Open = this.candles.map(c => c.open);
    rt.High = this.candles.map(c => c.high);
    rt.Low = this.candles.map(c => c.low);
    rt.Close = this.candles.map(c => c.close);
    rt.Time = this.candles.map(c => c.time);
    rt.Volume = this.candles.map(c => c.volume ?? 0);
    rt.Bars = this.candles.length;
    rt.Digits = rt._Digits = 5;
    rt.Point = rt._Point = Math.pow(10, -5);
    rt.Bid = this.candles[0]?.close ?? 0;
    rt.Ask = this.candles[0]?.close ?? 0;
    rt._Symbol = 'TEST';
    if (this.candles.length > 1) {
      rt._Period = this.candles[1].time - this.candles[0].time;
    }
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
      ResetLastError: () => {
        this.runtime.globalValues._LastError = 0;
        return 0;
      },
      GetLastError: () => this.runtime.globalValues._LastError,
      IsStopped: () => this.runtime.globalValues._StopFlag,
      OrderSend: (
        symbol: string,
        cmd: number,
        volume: number,
        price: number,
        slippage: number,
        sl: number,
        tp: number,
      ) => {
        return this.broker.sendOrder({
          symbol,
          cmd,
          volume,
          price,
          sl,
          tp,
          time: this.candles[this.index].time,
          bid: this.runtime.globalValues.Bid,
          ask: this.runtime.globalValues.Ask,
        });
      },
    };
  }

  step(): void {
    const entry = this.options.entryPoint || 'OnTick';
    if (this.index >= this.candles.length) return;
    const candle = this.candles[this.index];
    this.runtime.globalValues.Bid = candle.close;
    this.runtime.globalValues.Ask = candle.close;
    this.broker.update(candle);
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

  getBroker(): Broker {
    return this.broker;
  }

  getAccountMetrics() {
    const bid = this.runtime.globalValues.Bid;
    const ask = this.runtime.globalValues.Ask;
    return this.broker.getAccountMetrics(bid, ask);
  }
}


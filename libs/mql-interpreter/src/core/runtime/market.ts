import type { Candle, Tick } from "./marketTypes";
export type { Candle, Tick } from "./marketTypes";

export class MarketData {
  private ticks: Record<string, Tick[]> = {};
  private positions: Record<string, number> = {};
  private selected: Set<string> = new Set();
  private candles: Record<string, Record<number, Candle[]>> = {};

  constructor(
    tickData: Record<string, Tick[]>,
    candleData: Record<string, Record<number, Candle[]>> = {}
  ) {
    for (const symbol in tickData) {
      this.ticks[symbol] = [...tickData[symbol]].sort((a, b) => a.time - b.time);
      this.positions[symbol] = 0;
      this.selected.add(symbol);
      this.candles[symbol] = { ...(candleData[symbol] ?? {}) };
    }
    for (const symbol in candleData) {
      if (!this.candles[symbol]) this.candles[symbol] = { ...candleData[symbol] };
    }
  }

  getSymbols(selectedOnly = false): string[] {
    if (selectedOnly) return Array.from(this.selected);
    return Object.keys(this.ticks);
  }

  select(symbol: string, enable: boolean): boolean {
    if (!(symbol in this.ticks)) return false;
    if (enable) this.selected.add(symbol);
    else this.selected.delete(symbol);
    return true;
  }

  /** Return latest tick at or before the given time */
  getTick(symbol: string, time: number): Tick | undefined {
    const arr = this.ticks[symbol];
    if (!arr || !arr.length) return undefined;
    let pos = this.positions[symbol] ?? 0;
    while (pos + 1 < arr.length && arr[pos + 1].time <= time) pos++;
    this.positions[symbol] = pos;
    return arr[pos];
  }

  /** Aggregate ticks into candles of the given timeframe */
  private buildCandles(symbol: string, timeframe: number): Candle[] {
    const ticks = this.ticks[symbol];
    if (!ticks || !ticks.length) return [];
    const sorted = [...ticks].sort((a, b) => a.time - b.time);
    const mid = (t: Tick) => (t.bid + t.ask) / 2;
    const candles: Candle[] = [];
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

  getCandles(symbol: string, timeframe: number): Candle[] {
    let byTf = this.candles[symbol];
    if (!byTf) {
      byTf = {};
      this.candles[symbol] = byTf;
    }
    if (!byTf[timeframe]) {
      byTf[timeframe] = this.buildCandles(symbol, timeframe);
    }
    return byTf[timeframe];
  }
}

export function ticksToCandles(ticks: Tick[], timeframe: number): Candle[] {
  if (!ticks.length) return [];
  const sorted = [...ticks].sort((a, b) => a.time - b.time);
  const mid = (t: Tick) => (t.bid + t.ask) / 2;
  const candles: Candle[] = [];
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

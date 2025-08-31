import type {
  Candle,
  Tick,
  IMarketData,
} from "../../../libs/mql-interpreter/src/libs/domain/marketData/types.ts";

export class ApiMarketData implements IMarketData {
  private candles: Record<string, Record<number, Candle[]>> = {};
  private symbols = new Set<string>();
  private selected = new Set<string>();

  async load(symbol: string, timeframe: number): Promise<void> {
    if (this.candles[symbol]?.[timeframe]) return;
    const res = await fetch(`/api/market/${symbol}/${timeframe}`);
    const data: Candle[] = await res.json();
    if (!this.candles[symbol]) this.candles[symbol] = {};
    this.candles[symbol][timeframe] = data;
    this.symbols.add(symbol);
  }

  async update(symbol: string, timeframe: number): Promise<Candle[]> {
    const arr = this.candles[symbol]?.[timeframe] ?? [];
    const since = arr.length ? arr[arr.length - 1].time : 0;
    const res = await fetch(`/api/market/${symbol}/${timeframe}?since=${since}`);
    const data: Candle[] = await res.json();
    if (!this.candles[symbol]) this.candles[symbol] = {};
    if (!this.candles[symbol][timeframe]) this.candles[symbol][timeframe] = [];
    this.candles[symbol][timeframe].push(...data);
    this.symbols.add(symbol);
    return data;
  }

  getSymbols(selectedOnly = false): string[] {
    return Array.from(selectedOnly ? this.selected : this.symbols);
  }

  select(symbol: string, enable: boolean): boolean {
    if (enable) this.selected.add(symbol);
    else this.selected.delete(symbol);
    return true;
  }

  getIndex(symbol: string, timeframe: number, time: number): number {
    const arr = this.candles[symbol]?.[timeframe];
    if (!arr) return -1;
    let i = arr.length - 1;
    while (i >= 0 && arr[i].time > time) i--;
    return i;
  }

  getTick(symbol: string, time: number): Tick | undefined {
    void symbol;
    void time;
    return undefined;
  }

  getCandle(symbol: string, timeframe: number, time: number): Candle | undefined {
    const index = this.getIndex(symbol, timeframe, time);
    const arr = this.candles[symbol]?.[timeframe];
    return index >= 0 && arr ? arr[index] : undefined;
  }

  getCandles(symbol: string, timeframe: number): Candle[] {
    return this.candles[symbol]?.[timeframe] ?? [];
  }
}

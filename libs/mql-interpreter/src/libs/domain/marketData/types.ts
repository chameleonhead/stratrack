export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface Tick {
  time: number;
  bid: number;
  ask: number;
}

export interface IMarketData {
  getSymbols(selectedOnly?: boolean): string[];
  select(symbol: string, enable: boolean): boolean;
  getIndex(symbol: string, timeframe: number, time: number): number;
  getTick(symbol: string, time: number): Tick | undefined;
  getCandle(symbol: string, timeframe: number, time: number): Candle | undefined;
  getCandles(symbol: string, timeframe: number): Candle[];
}

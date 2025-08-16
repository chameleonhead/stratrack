import { MqlLibrary } from "./types";
import { MarketData } from "./marketData";

export function createBacktestLibs(data: MarketData): MqlLibrary {
  return {
    iMA: (
      symbol: string,
      timeframe: number,
      period: number,
      shift: number,
      _maMethod: number,
      _appliedPrice: number,
      barShift: number
    ) => {
      const candles = data.getCandles(symbol, timeframe);
      const idx = candles.length - 1 - (shift + barShift);
      if (idx < period - 1) return 0;
      let sum = 0;
      for (let i = idx - period + 1; i <= idx; i++) {
        sum += candles[i].close;
      }
      return sum / period;
    },
    OrderSend: (_request: any) => {
      return { ticket: 1, result: "ok" };
    },
  };
}

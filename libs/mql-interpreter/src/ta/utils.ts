import type { ExecutionContext } from "../libs/domain/types";
import type { Candle } from "../libs/domain/marketData";

export function candlesFor(context: ExecutionContext, symbol: string, timeframe: number): Candle[] {
  if (!context.market) return [];
  return context.market.getCandles(symbol, timeframe);
}

export function priceVal(candle: Candle, applied: number): number {
  switch (applied) {
    case 1:
      return candle.open;
    case 2:
      return candle.high;
    case 3:
      return candle.low;
    case 4:
      return (candle.high + candle.low) / 2;
    case 5:
      return (candle.high + candle.low + candle.close) / 3;
    case 6:
      return (candle.high + candle.low + 2 * candle.close) / 4;
    default:
      return candle.close;
  }
}

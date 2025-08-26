import type { ExecutionContext } from "../libs/domain/types";
import { iMACD } from "./macd";

export function iOsMA(
  context: ExecutionContext,
  symbol: string,
  timeframe: number,
  fast_ema_period: number,
  slow_ema_period: number,
  signal_period: number,
  applied_price: number,
  shift: number
): number {
  return iMACD(
    context,
    symbol,
    timeframe,
    fast_ema_period,
    slow_ema_period,
    signal_period,
    applied_price,
    2,
    shift
  );
}

import type { ExecutionContext } from "../libs/domain/types";
import type { IndicatorEngine } from "../libs/domain/indicator";
import { candlesFor } from "./utils";
import { iMAOnArray } from "./ma";

export function iStochastic(
  context: ExecutionContext,
  symbol: string,
  timeframe: number,
  k_period: number,
  d_period: number,
  slowing: number,
  method: number,
  price_field: number,
  mode: number,
  shift: number
): number {
  const candles = candlesFor(context, symbol, timeframe);
  const curIdx = candles.length - 1;
  const engine: IndicatorEngine | undefined = context.indicatorEngine ?? undefined;
  if (!engine) return 0;

  const key = {
    type: "iStochastic",
    symbol,
    timeframe,
    params: { k_period, d_period, slowing, method, price_field },
  } as const;

  const ctx = engine.getOrCreate(key, () => ({
    last: -1,
    k: [] as number[],
    d: [] as number[],
    rawK: [] as number[],
  }));

  if (ctx.last < curIdx) {
    for (let i = ctx.last + 1; i <= curIdx; i++) {
      let highest = -Infinity;
      let lowest = Infinity;
      const start = Math.max(0, i - k_period + 1);
      for (let j = start; j <= i; j++) {
        const candle = candles[j];
        const high = price_field === 1 ? candle.close : candle.high;
        const low = price_field === 1 ? candle.close : candle.low;
        if (high > highest) highest = high;
        if (low < lowest) lowest = low;
      }
      const close = candles[i].close;
      ctx.rawK[i] = highest === lowest ? 0 : ((close - lowest) / (highest - lowest)) * 100;

      // slowing using selected MA method
      ctx.k[i] = iMAOnArray(ctx.rawK, i + 1, slowing, 0, method, 0);

      // %D
      ctx.d[i] = iMAOnArray(ctx.k, i + 1, d_period, 0, method, 0);

      ctx.last = i;
    }
  }

  const idx = candles.length - 1 - shift;
  if (idx < 0) return 0;
  return mode === 0 ? (ctx.k[idx] ?? 0) : (ctx.d[idx] ?? 0);
}

import type { ExecutionContext } from "../libs/domain/types";
import type { IndicatorEngine } from "../libs/domain/indicator";
import { candlesFor } from "./utils";

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
  if (method !== 0) return 0; // only simple moving averages supported
  const candles = candlesFor(context, symbol, timeframe);
  const curIdx = candles.length - 1;
  const engine: IndicatorEngine | undefined = context.indicatorEngine ?? undefined;
  if (!engine) return 0;

  const key = {
    type: "iStochastic",
    symbol,
    timeframe,
    params: { k_period, d_period, slowing, price_field },
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

      // slowing
      let sumK = 0;
      const slowStart = Math.max(0, i - slowing + 1);
      for (let j = slowStart; j <= i; j++) sumK += ctx.rawK[j] ?? 0;
      ctx.k[i] = sumK / Math.min(slowing, i + 1);

      // %D
      let sumD = 0;
      const dStart = Math.max(0, i - d_period + 1);
      for (let j = dStart; j <= i; j++) sumD += ctx.k[j] ?? 0;
      ctx.d[i] = sumD / Math.min(d_period, i + 1);

      ctx.last = i;
    }
  }

  const idx = candles.length - 1 - shift;
  if (idx < 0) return 0;
  return mode === 0 ? (ctx.k[idx] ?? 0) : (ctx.d[idx] ?? 0);
}

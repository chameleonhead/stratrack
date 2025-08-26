import type { ExecutionContext } from "../libs/domain/types";
import type { IndicatorEngine } from "../libs/domain/indicator";
import { candlesFor, priceVal } from "./utils";

export function iCCI(
  context: ExecutionContext,
  symbol: string,
  timeframe: number,
  period: number,
  applied: number,
  shift: number
): number {
  const candles = candlesFor(context, symbol, timeframe);
  const curIdx = candles.length - 1;
  const engine: IndicatorEngine | undefined = context.indicatorEngine ?? undefined;
  if (!engine) return 0;

  const key = {
    type: "iCCI",
    symbol,
    timeframe,
    params: { period, applied },
  } as const;

  const ctx = engine.getOrCreate(key, () => ({
    last: -1,
    values: [] as number[],
    prices: [] as number[],
    sum: 0,
  }));

  if (ctx.last < curIdx) {
    for (let i = ctx.last + 1; i <= curIdx; i++) {
      const price = priceVal(candles[i], applied);
      ctx.prices[i] = price;
      ctx.sum += price;
      if (i >= period) ctx.sum -= ctx.prices[i - period];
      if (i >= period - 1) {
        const mean = ctx.sum / period;
        let dev = 0;
        for (let j = i - period + 1; j <= i; j++) {
          dev += Math.abs(ctx.prices[j] - mean);
        }
        const md = dev / period;
        ctx.values[i] = md === 0 ? 0 : (price - mean) / (0.015 * md);
      } else {
        ctx.values[i] = 0;
      }
      ctx.last = i;
    }
  }

  const idx = candles.length - 1 - shift;
  return idx < 0 ? 0 : (ctx.values[idx] ?? 0);
}

export function iCCIOnArray(array: number[], total: number, period: number, shift: number): number {
  const idx = total - 1 - shift;
  if (idx - period + 1 < 0) return 0;
  let sum = 0;
  for (let i = idx - period + 1; i <= idx; i++) sum += array[i];
  const mean = sum / period;
  let dev = 0;
  for (let i = idx - period + 1; i <= idx; i++) dev += Math.abs(array[i] - mean);
  const md = dev / period;
  if (md === 0) return 0;
  return (array[idx] - mean) / (0.015 * md);
}

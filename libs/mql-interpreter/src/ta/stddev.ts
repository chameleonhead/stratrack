import type { ExecutionContext } from "../libs/domain/types";
import type { IndicatorEngine } from "../libs/domain/indicator";
import { candlesFor, priceVal } from "./utils";

export function iStdDev(
  context: ExecutionContext,
  symbol: string,
  timeframe: number,
  ma_period: number,
  ma_shift: number,
  ma_method: number,
  applied: number,
  shift: number
): number {
  const candles = candlesFor(context, symbol, timeframe);
  const curIdx = candles.length - 1;
  const engine: IndicatorEngine | undefined = context.indicatorEngine ?? undefined;
  if (!engine) return 0;

  const key = {
    type: "iStdDev",
    symbol,
    timeframe,
    params: { ma_period, ma_method, applied },
  } as const;

  const ctx = engine.getOrCreate(key, () => ({
    last: -1,
    values: [] as number[],
    sum: 0,
    sumSq: 0,
  }));

  if (ctx.last < curIdx) {
    for (let i = ctx.last + 1; i <= curIdx; i++) {
      const price = priceVal(candles[i], applied);
      ctx.sum += price;
      ctx.sumSq += price * price;
      if (i >= ma_period) {
        const old = priceVal(candles[i - ma_period], applied);
        ctx.sum -= old;
        ctx.sumSq -= old * old;
      }
      if (i >= ma_period - 1) {
        const mean = ctx.sum / ma_period;
        const variance = ctx.sumSq / ma_period - mean * mean;
        ctx.values[i] = Math.sqrt(Math.max(variance, 0));
      } else {
        ctx.values[i] = 0;
      }
      ctx.last = i;
    }
  }

  const idx = candles.length - 1 - (shift + ma_shift);
  return idx < 0 ? 0 : (ctx.values[idx] ?? 0);
}

export function iStdDevOnArray(
  array: number[],
  total: number,
  ma_period: number,
  ma_shift: number,
  ma_method: number,
  shift: number
): number {
  const idx = total - 1 - (shift + ma_shift);
  if (idx - ma_period + 1 < 0) return 0;
  let sum = 0;
  let sumSq = 0;
  for (let i = idx - ma_period + 1; i <= idx; i++) {
    const v = array[i];
    sum += v;
    sumSq += v * v;
  }
  const mean = sum / ma_period;
  const variance = sumSq / ma_period - mean * mean;
  return Math.sqrt(Math.max(variance, 0));
}

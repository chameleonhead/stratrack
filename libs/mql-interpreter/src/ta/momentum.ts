import type { ExecutionContext } from "../libs/domain/types";
import type { IndicatorEngine } from "../libs/domain/indicator";
import { candlesFor, priceVal } from "./utils";

export function iMomentum(
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
    type: "iMomentum",
    symbol,
    timeframe,
    params: { period, applied },
  } as const;

  const ctx = engine.getOrCreate(key, () => ({
    last: -1,
    values: [] as number[],
  }));

  if (ctx.last < curIdx) {
    for (let i = ctx.last + 1; i <= curIdx; i++) {
      const price = priceVal(candles[i], applied);
      ctx.values[i] = i >= period ? price - priceVal(candles[i - period], applied) : 0;
      ctx.last = i;
    }
  }

  const idx = candles.length - 1 - shift;
  return idx < 0 ? 0 : (ctx.values[idx] ?? 0);
}

export function iMomentumOnArray(
  array: number[],
  total: number,
  period: number,
  shift: number
): number {
  const idx = total - 1 - shift;
  if (idx - period < 0) return 0;
  return array[idx] - array[idx - period];
}

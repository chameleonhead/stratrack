import type { ExecutionContext } from "../libs/domain/types";
import type { IndicatorEngine } from "../libs/domain/indicator";
import { candlesFor, priceVal } from "./utils";

export function iForce(
  context: ExecutionContext,
  symbol: string,
  timeframe: number,
  period: number,
  ma_method: number,
  applied: number,
  shift: number
): number {
  const candles = candlesFor(context, symbol, timeframe);
  const curIdx = candles.length - 1;
  const engine: IndicatorEngine | undefined = context.indicatorEngine ?? undefined;
  if (!engine) return 0;

  const key = { type: "iForce", symbol, timeframe, params: { period, applied } } as const;
  const ctx = engine.getOrCreate(key, () => ({
    last: -1,
    raw: [] as number[],
    values: [] as number[],
    sum: 0,
  }));

  if (ctx.last < curIdx) {
    for (let i = ctx.last + 1; i <= curIdx; i++) {
      const price = priceVal(candles[i], applied);
      const prev = i > 0 ? priceVal(candles[i - 1], applied) : price;
      ctx.raw[i] = (price - prev) * candles[i].volume;
      ctx.sum += ctx.raw[i];
      if (i >= period) ctx.sum -= ctx.raw[i - period];
      ctx.values[i] = i >= period - 1 ? ctx.sum / period : 0;
      ctx.last = i;
    }
  }

  const idx = candles.length - 1 - shift;
  return idx < 0 ? 0 : (ctx.values[idx] ?? 0);
}

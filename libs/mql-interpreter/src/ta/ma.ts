import type { ExecutionContext } from "../libs/domain/types";
import type { IndicatorEngine } from "../libs/domain/indicator";
import { candlesFor, priceVal } from "./utils";

export function iMA(
  context: ExecutionContext,
  symbol: string,
  timeframe: number,
  period: number,
  maShift: number,
  maMethod: number,
  applied: number,
  shift: number
): number {
  const arr = candlesFor(context, symbol, timeframe);
  const curIdx = arr.length - 1;
  const engine: IndicatorEngine | undefined = context.indicatorEngine ?? undefined;
  if (!engine) return 0;

  const key = {
    type: "iMA",
    symbol,
    timeframe,
    params: { period, maMethod, applied },
  } as const;

  const ctx = engine.getOrCreate(key, () => ({
    last: -1,
    values: [] as number[],
    sum: 0,
  }));

  if (ctx.last < curIdx) {
    for (let i = ctx.last + 1; i <= curIdx; i++) {
      const price = priceVal(arr[i], applied);
      ctx.sum += price;
      if (i >= period) ctx.sum -= priceVal(arr[i - period], applied);
      ctx.values[i] = i >= period - 1 ? ctx.sum / period : 0;
      ctx.last = i;
    }
  }

  const idx = arr.length - 1 - (shift + maShift);
  return idx < 0 ? 0 : (ctx.values[idx] ?? 0);
}

import type { ExecutionContext } from "../libs/domain/types";
import type { IndicatorEngine } from "../libs/domain/indicator";
import { candlesFor, priceVal } from "./utils";

export function iAO(
  context: ExecutionContext,
  symbol: string,
  timeframe: number,
  shift: number
): number {
  const candles = candlesFor(context, symbol, timeframe);
  const curIdx = candles.length - 1;
  const engine: IndicatorEngine | undefined = context.indicatorEngine ?? undefined;
  if (!engine) return 0;

  const key = { type: "iAO", symbol, timeframe } as const;

  const ctx = engine.getOrCreate(key, () => ({
    last: -1,
    values: [] as number[],
    sum5: 0,
    sum34: 0,
  }));

  if (ctx.last < curIdx) {
    for (let i = ctx.last + 1; i <= curIdx; i++) {
      const price = priceVal(candles[i], 4);
      ctx.sum5 += price;
      ctx.sum34 += price;
      if (i >= 5) ctx.sum5 -= priceVal(candles[i - 5], 4);
      if (i >= 34) ctx.sum34 -= priceVal(candles[i - 34], 4);
      const fast = i >= 4 ? ctx.sum5 / 5 : 0;
      const slow = i >= 33 ? ctx.sum34 / 34 : 0;
      ctx.values[i] = fast - slow;
      ctx.last = i;
    }
  }

  const idx = candles.length - 1 - shift;
  return idx < 0 ? 0 : (ctx.values[idx] ?? 0);
}

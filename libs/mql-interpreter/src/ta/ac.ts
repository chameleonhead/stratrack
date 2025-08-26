import type { ExecutionContext } from "../libs/domain/types";
import type { IndicatorEngine } from "../libs/domain/indicator";
import { candlesFor } from "./utils";
import { iAO } from "./ao";

export function iAC(
  context: ExecutionContext,
  symbol: string,
  timeframe: number,
  shift: number
): number {
  const candles = candlesFor(context, symbol, timeframe);
  const curIdx = candles.length - 1;
  const engine: IndicatorEngine | undefined = context.indicatorEngine ?? undefined;
  if (!engine) return 0;

  const key = { type: "iAC", symbol, timeframe } as const;

  const ctx = engine.getOrCreate(key, () => ({
    last: -1,
    values: [] as number[],
    sum: 0,
  }));

  if (ctx.last < curIdx) {
    for (let i = ctx.last + 1; i <= curIdx; i++) {
      const ao = iAO(context, symbol, timeframe, curIdx - i);
      ctx.sum += ao;
      if (i >= 5) {
        const old = iAO(context, symbol, timeframe, curIdx - i + 5);
        ctx.sum -= old;
      }
      const ma = i >= 4 ? ctx.sum / 5 : 0;
      ctx.values[i] = ao - ma;
      ctx.last = i;
    }
  }

  const idx = candles.length - 1 - shift;
  return idx < 0 ? 0 : (ctx.values[idx] ?? 0);
}

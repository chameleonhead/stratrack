import type { ExecutionContext } from "../libs/domain/types";
import type { IndicatorEngine } from "../libs/domain/indicator";
import { candlesFor } from "./utils";

export function iDeMarker(
  context: ExecutionContext,
  symbol: string,
  timeframe: number,
  period: number,
  shift: number
): number {
  const candles = candlesFor(context, symbol, timeframe);
  const curIdx = candles.length - 1;
  const engine: IndicatorEngine | undefined = context.indicatorEngine ?? undefined;
  if (!engine) return 0;

  const key = { type: "iDeMarker", symbol, timeframe, params: { period } } as const;
  const ctx = engine.getOrCreate(key, () => ({
    last: -1,
    values: [] as number[],
    demax: [] as number[],
    demin: [] as number[],
    sumMax: 0,
    sumMin: 0,
  }));

  if (ctx.last < curIdx) {
    for (let i = ctx.last + 1; i <= curIdx; i++) {
      if (i > 0) {
        const demax = Math.max(candles[i].high - candles[i - 1].high, 0);
        const demin = Math.max(candles[i - 1].low - candles[i].low, 0);
        ctx.demax[i] = demax;
        ctx.demin[i] = demin;
      } else {
        ctx.demax[i] = 0;
        ctx.demin[i] = 0;
      }
      ctx.sumMax += ctx.demax[i];
      ctx.sumMin += ctx.demin[i];
      if (i >= period) {
        ctx.sumMax -= ctx.demax[i - period];
        ctx.sumMin -= ctx.demin[i - period];
      }
      const denom = ctx.sumMax + ctx.sumMin;
      ctx.values[i] = denom === 0 ? 0 : (ctx.sumMax / denom) * 100;
      ctx.last = i;
    }
  }

  const idx = candles.length - 1 - shift;
  return idx < 0 ? 0 : (ctx.values[idx] ?? 0);
}

import type { ExecutionContext } from "../libs/domain/types";
import type { IndicatorEngine } from "../libs/domain/indicator";
import { candlesFor } from "./utils";

export function iATR(
  context: ExecutionContext,
  symbol: string,
  timeframe: number,
  period: number,
  shift: number
): number {
  const arr = candlesFor(context, symbol, timeframe);
  const curIdx = arr.length - 1;
  const engine: IndicatorEngine | undefined = context.indicatorEngine ?? undefined;
  if (!engine) return 0;

  const key = {
    type: "iATR",
    symbol,
    timeframe,
    params: { period },
  } as const;

  const ctx = engine.getOrCreate(key, () => ({
    last: -1,
    values: [] as number[],
    atr: 0,
    prevClose: 0,
  }));

  if (ctx.last < 0 && curIdx >= 0) {
    const first = arr[0];
    ctx.prevClose = first.close;
    ctx.values[0] = 0;
    ctx.last = 0;
  }

  if (ctx.last < curIdx) {
    for (let i = ctx.last + 1; i <= curIdx; i++) {
      const cur = arr[i];
      const tr = Math.max(
        cur.high - cur.low,
        Math.abs(cur.high - ctx.prevClose),
        Math.abs(cur.low - ctx.prevClose)
      );
      if (i <= period) {
        ctx.atr = (ctx.atr * (i - 1) + tr) / i;
      } else {
        ctx.atr = (ctx.atr * (period - 1) + tr) / period;
      }
      ctx.values[i] = ctx.atr;
      ctx.prevClose = cur.close;
      ctx.last = i;
    }
  }

  const idx = arr.length - 1 - shift;
  return idx < 0 ? 0 : (ctx.values[idx] ?? 0);
}

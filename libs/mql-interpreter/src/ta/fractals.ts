import type { ExecutionContext } from "../libs/domain/types";
import type { IndicatorEngine } from "../libs/domain/indicator";
import { candlesFor } from "./utils";

export function iFractals(
  context: ExecutionContext,
  symbol: string,
  timeframe: number,
  mode: number,
  shift: number
): number {
  const candles = candlesFor(context, symbol, timeframe);
  const curIdx = candles.length - 1;
  const engine: IndicatorEngine | undefined = context.indicatorEngine ?? undefined;
  if (!engine) return 0;
  const key = { type: "iFractals", symbol, timeframe } as const;
  const ctx = engine.getOrCreate(key, () => ({
    last: -1,
    up: [] as number[],
    down: [] as number[],
  }));
  if (ctx.last < curIdx) {
    for (let i = Math.max(2, ctx.last + 1); i <= curIdx - 2; i++) {
      const c0 = candles[i - 2];
      const c1 = candles[i - 1];
      const c2 = candles[i];
      const c3 = candles[i + 1];
      const c4 = candles[i + 2];
      if (c2.high > c1.high && c2.high > c3.high && c2.high > c0.high && c2.high > c4.high) {
        ctx.up[i] = c2.high;
      }
      if (c2.low < c1.low && c2.low < c3.low && c2.low < c0.low && c2.low < c4.low) {
        ctx.down[i] = c2.low;
      }
      ctx.last = i;
    }
    ctx.last = curIdx - 2;
  }
  const idx = candles.length - 1 - shift;
  if (idx < 0) return 0;
  return mode === 0 ? (ctx.up[idx] ?? 0) : (ctx.down[idx] ?? 0);
}

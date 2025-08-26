import type { ExecutionContext } from "../libs/domain/types";
import type { IndicatorEngine } from "../libs/domain/indicator";
import { candlesFor } from "./utils";

export function iRVI(
  context: ExecutionContext,
  symbol: string,
  timeframe: number,
  period: number,
  mode: number,
  shift: number
): number {
  const candles = candlesFor(context, symbol, timeframe);
  const curIdx = candles.length - 1;
  const engine: IndicatorEngine | undefined = context.indicatorEngine ?? undefined;
  if (!engine) return 0;
  const key = { type: "iRVI", symbol, timeframe, params: { period } } as const;
  const ctx = engine.getOrCreate(key, () => ({
    last: -1,
    numVals: [] as number[],
    denVals: [] as number[],
    rvi: [] as number[],
    signal: [] as number[],
    numSum: 0,
    denSum: 0,
  }));
  if (ctx.last < curIdx) {
    for (let i = Math.max(3, ctx.last + 1); i <= curIdx; i++) {
      const c0 = candles[i];
      const c1 = candles[i - 1];
      const c2 = candles[i - 2];
      const c3 = candles[i - 3];
      const num =
        (c0.close -
          c0.open +
          2 * (c1.close - c1.open) +
          2 * (c2.close - c2.open) +
          (c3.close - c3.open)) /
        6;
      const den =
        (c0.high - c0.low + 2 * (c1.high - c1.low) + 2 * (c2.high - c2.low) + (c3.high - c3.low)) /
        6;
      ctx.numVals[i] = num;
      ctx.denVals[i] = den;
      ctx.numSum += num;
      ctx.denSum += den;
      if (i >= period + 3) {
        ctx.numSum -= ctx.numVals[i - period] || 0;
        ctx.denSum -= ctx.denVals[i - period] || 0;
        const rvi = ctx.denSum === 0 ? 0 : ctx.numSum / ctx.denSum;
        ctx.rvi[i] = rvi;
        if (i >= period + 6) {
          const r1 = ctx.rvi[i];
          const r2 = ctx.rvi[i - 1];
          const r3 = ctx.rvi[i - 2];
          const r4 = ctx.rvi[i - 3];
          ctx.signal[i] = (r1 + 2 * r2 + 2 * r3 + r4) / 6;
        }
      }
      ctx.last = i;
    }
  }
  const idx = candles.length - 1 - shift;
  if (idx < 0) return 0;
  return mode === 1 ? (ctx.signal[idx] ?? 0) : (ctx.rvi[idx] ?? 0);
}

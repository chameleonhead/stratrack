import type { ExecutionContext } from "../libs/domain/types";
import type { IndicatorEngine } from "../libs/domain/indicator";
import { candlesFor, priceVal } from "./utils";

export function iBullsPower(
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
  const key = { type: "iBullsPower", symbol, timeframe, params: { period, applied } } as const;
  const ctx = engine.getOrCreate(key, () => ({ last: -1, ema: 0, values: [] as number[] }));
  if (ctx.last < 0 && curIdx >= 0) {
    ctx.ema = priceVal(candles[0], applied);
    ctx.values[0] = candles[0].high - ctx.ema;
    ctx.last = 0;
  }
  const alpha = 2 / (period + 1);
  if (ctx.last < curIdx) {
    for (let i = ctx.last + 1; i <= curIdx; i++) {
      const price = priceVal(candles[i], applied);
      ctx.ema = ctx.ema + alpha * (price - ctx.ema);
      ctx.values[i] = candles[i].high - ctx.ema;
      ctx.last = i;
    }
  }
  const idx = candles.length - 1 - shift;
  return idx < 0 ? 0 : (ctx.values[idx] ?? 0);
}

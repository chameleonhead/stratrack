import type { ExecutionContext } from "../libs/domain/types";
import type { IndicatorEngine } from "../libs/domain/indicator";
import { candlesFor } from "./utils";

export function iSAR(
  context: ExecutionContext,
  symbol: string,
  timeframe: number,
  step: number,
  max: number,
  shift: number
): number {
  const candles = candlesFor(context, symbol, timeframe);
  const curIdx = candles.length - 1;
  const engine: IndicatorEngine | undefined = context.indicatorEngine ?? undefined;
  if (!engine) return 0;
  const key = { type: "iSAR", symbol, timeframe, params: { step, max } } as const;
  const ctx = engine.getOrCreate(key, () => ({
    last: -1,
    values: [] as number[],
    trendUp: true,
    ep: 0,
    af: step,
  }));
  if (ctx.last < 0 && curIdx >= 1) {
    const first = candles[0];
    const second = candles[1];
    ctx.trendUp = second.close >= first.close;
    ctx.ep = ctx.trendUp ? Math.max(first.high, second.high) : Math.min(first.low, second.low);
    ctx.values[1] = ctx.trendUp ? first.low : first.high;
    ctx.last = 1;
  }
  if (ctx.last < curIdx) {
    for (let i = ctx.last + 1; i <= curIdx; i++) {
      const prevSar = ctx.values[i - 1];
      const prev = candles[i - 1];
      let sar = ctx.trendUp
        ? prevSar + ctx.af * (ctx.ep - prevSar)
        : prevSar - ctx.af * (prevSar - ctx.ep);
      if (ctx.trendUp) {
        sar = Math.min(sar, prev.low, candles[i].low);
        if (candles[i].low < sar) {
          ctx.trendUp = false;
          sar = ctx.ep;
          ctx.ep = candles[i].low;
          ctx.af = step;
        } else if (candles[i].high > ctx.ep) {
          ctx.ep = candles[i].high;
          ctx.af = Math.min(ctx.af + step, max);
        }
      } else {
        sar = Math.max(sar, prev.high, candles[i].high);
        if (candles[i].high > sar) {
          ctx.trendUp = true;
          sar = ctx.ep;
          ctx.ep = candles[i].high;
          ctx.af = step;
        } else if (candles[i].low < ctx.ep) {
          ctx.ep = candles[i].low;
          ctx.af = Math.min(ctx.af + step, max);
        }
      }
      ctx.values[i] = sar;
      ctx.last = i;
    }
  }
  const idx = candles.length - 1 - shift;
  return idx < 0 ? 0 : (ctx.values[idx] ?? 0);
}

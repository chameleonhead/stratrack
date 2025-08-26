import type { ExecutionContext } from "../libs/domain/types";
import type { IndicatorEngine } from "../libs/domain/indicator";
import { candlesFor } from "./utils";

export function iADX(
  context: ExecutionContext,
  symbol: string,
  timeframe: number,
  period: number,
  _applied_price: number,
  mode: number,
  shift: number
): number {
  const candles = candlesFor(context, symbol, timeframe);
  const curIdx = candles.length - 1;
  const engine: IndicatorEngine | undefined = context.indicatorEngine ?? undefined;
  if (!engine) return 0;
  const key = { type: "iADX", symbol, timeframe, params: { period } } as const;
  const ctx = engine.getOrCreate(key, () => ({
    last: -1,
    tr14: 0,
    plusDM14: 0,
    minusDM14: 0,
    adx: [] as number[],
    plusDI: [] as number[],
    minusDI: [] as number[],
  }));
  if (ctx.last < curIdx) {
    for (let i = Math.max(1, ctx.last + 1); i <= curIdx; i++) {
      const cur = candles[i];
      const prev = candles[i - 1];
      const upMove = cur.high - prev.high;
      const downMove = prev.low - cur.low;
      const plusDM = upMove > downMove && upMove > 0 ? upMove : 0;
      const minusDM = downMove > upMove && downMove > 0 ? downMove : 0;
      const tr = Math.max(
        cur.high - cur.low,
        Math.abs(cur.high - prev.close),
        Math.abs(cur.low - prev.close)
      );
      if (i <= period) {
        ctx.tr14 += tr;
        ctx.plusDM14 += plusDM;
        ctx.minusDM14 += minusDM;
        if (i === period) {
          const plusDI = (ctx.plusDM14 / ctx.tr14) * 100;
          const minusDI = (ctx.minusDM14 / ctx.tr14) * 100;
          ctx.plusDI[i] = plusDI;
          ctx.minusDI[i] = minusDI;
          const dx = (Math.abs(plusDI - minusDI) / (plusDI + minusDI)) * 100;
          ctx.adx[i] = dx;
        }
      } else {
        ctx.tr14 = ctx.tr14 - ctx.tr14 / period + tr;
        ctx.plusDM14 = ctx.plusDM14 - ctx.plusDM14 / period + plusDM;
        ctx.minusDM14 = ctx.minusDM14 - ctx.minusDM14 / period + minusDM;
        const plusDI = (ctx.plusDM14 / ctx.tr14) * 100;
        const minusDI = (ctx.minusDM14 / ctx.tr14) * 100;
        ctx.plusDI[i] = plusDI;
        ctx.minusDI[i] = minusDI;
        const dx = (Math.abs(plusDI - minusDI) / (plusDI + minusDI)) * 100;
        ctx.adx[i] = (ctx.adx[i - 1] * (period - 1) + dx) / period;
      }
      ctx.last = i;
    }
  }
  const idx = candles.length - 1 - shift;
  if (idx < 0) return 0;
  if (mode === 1) return ctx.plusDI[idx] ?? 0;
  if (mode === 2) return ctx.minusDI[idx] ?? 0;
  return ctx.adx[idx] ?? 0;
}

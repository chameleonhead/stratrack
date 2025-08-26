import type { ExecutionContext } from "../libs/domain/types";
import type { IndicatorEngine } from "../libs/domain/indicator";
import { candlesFor } from "./utils";

export function iMFI(
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

  const key = { type: "iMFI", symbol, timeframe, params: { period } } as const;
  const ctx = engine.getOrCreate(key, () => ({
    last: -1,
    tp: [] as number[],
    pos: [] as number[],
    neg: [] as number[],
    mfi: [] as number[],
    sumPos: 0,
    sumNeg: 0,
  }));

  if (ctx.last < curIdx) {
    for (let i = ctx.last + 1; i <= curIdx; i++) {
      const c = candles[i];
      const tp = (c.high + c.low + c.close) / 3;
      ctx.tp[i] = tp;
      if (i > 0) {
        const prevTp = ctx.tp[i - 1];
        const mf = tp * c.volume;
        ctx.pos[i] = tp > prevTp ? mf : 0;
        ctx.neg[i] = tp < prevTp ? mf : 0;
      } else {
        ctx.pos[i] = 0;
        ctx.neg[i] = 0;
      }
      ctx.sumPos += ctx.pos[i];
      ctx.sumNeg += ctx.neg[i];
      if (i >= period) {
        ctx.sumPos -= ctx.pos[i - period];
        ctx.sumNeg -= ctx.neg[i - period];
      }
      const ratio = ctx.sumNeg === 0 ? Infinity : ctx.sumPos / ctx.sumNeg;
      ctx.mfi[i] = 100 - 100 / (1 + ratio);
      ctx.last = i;
    }
  }

  const idx = candles.length - 1 - shift;
  return idx < 0 ? 0 : (ctx.mfi[idx] ?? 0);
}

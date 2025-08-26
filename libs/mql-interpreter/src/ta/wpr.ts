import type { ExecutionContext } from "../libs/domain/types";
import type { IndicatorEngine } from "../libs/domain/indicator";
import { candlesFor } from "./utils";

export function iWPR(
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

  const key = { type: "iWPR", symbol, timeframe, params: { period } } as const;
  const ctx = engine.getOrCreate(key, () => ({
    last: -1,
    values: [] as number[],
  }));

  if (ctx.last < curIdx) {
    for (let i = ctx.last + 1; i <= curIdx; i++) {
      let highest = -Infinity;
      let lowest = Infinity;
      for (let j = Math.max(0, i - period + 1); j <= i; j++) {
        if (candles[j].high > highest) highest = candles[j].high;
        if (candles[j].low < lowest) lowest = candles[j].low;
      }
      if (i >= period - 1) {
        const close = candles[i].close;
        ctx.values[i] = highest === lowest ? 0 : ((highest - close) / (highest - lowest)) * -100;
      } else {
        ctx.values[i] = 0;
      }
      ctx.last = i;
    }
  }

  const idx = candles.length - 1 - shift;
  return idx < 0 ? 0 : (ctx.values[idx] ?? 0);
}

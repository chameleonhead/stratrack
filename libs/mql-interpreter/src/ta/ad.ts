import type { ExecutionContext } from "../libs/domain/types";
import type { IndicatorEngine } from "../libs/domain/indicator";
import { candlesFor } from "./utils";

export function iAD(
  context: ExecutionContext,
  symbol: string,
  timeframe: number,
  shift: number
): number {
  const candles = candlesFor(context, symbol, timeframe);
  const curIdx = candles.length - 1;
  const engine: IndicatorEngine | undefined = context.indicatorEngine ?? undefined;
  if (!engine) return 0;

  const key = { type: "iAD", symbol, timeframe } as const;
  const ctx = engine.getOrCreate(key, () => ({
    last: -1,
    values: [] as number[],
  }));

  if (ctx.last < curIdx) {
    for (let i = ctx.last + 1; i <= curIdx; i++) {
      const { high, low, close, volume = 0 } = candles[i];
      const prev = i > 0 ? ctx.values[i - 1] : 0;
      const range = high - low;
      const mfv = range === 0 ? 0 : ((close - low - (high - close)) / range) * volume;
      ctx.values[i] = prev + mfv;
      ctx.last = i;
    }
  }

  const idx = candles.length - 1 - shift;
  return idx < 0 ? 0 : (ctx.values[idx] ?? 0);
}

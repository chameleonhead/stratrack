import type { ExecutionContext } from "../libs/domain/types";
import type { IndicatorEngine } from "../libs/domain/indicator";
import { candlesFor, priceVal } from "./utils";

export function iOBV(
  context: ExecutionContext,
  symbol: string,
  timeframe: number,
  applied_price: number,
  shift: number
): number {
  const candles = candlesFor(context, symbol, timeframe);
  const curIdx = candles.length - 1;
  const engine: IndicatorEngine | undefined = context.indicatorEngine ?? undefined;
  if (!engine) return 0;

  const key = {
    type: "iOBV",
    symbol,
    timeframe,
    params: { applied_price },
  } as const;

  const ctx = engine.getOrCreate(key, () => ({
    last: -1,
    values: [] as number[],
  }));

  if (ctx.last < curIdx) {
    for (let i = ctx.last + 1; i <= curIdx; i++) {
      const price = priceVal(candles[i], applied_price);
      const prevPrice = i > 0 ? priceVal(candles[i - 1], applied_price) : price;
      const prev = i > 0 ? ctx.values[i - 1] : 0;
      const vol = candles[i].volume ?? 0;
      if (i === 0) ctx.values[0] = 0;
      else if (price > prevPrice) ctx.values[i] = prev + vol;
      else if (price < prevPrice) ctx.values[i] = prev - vol;
      else ctx.values[i] = prev;
      ctx.last = i;
    }
  }

  const idx = candles.length - 1 - shift;
  return idx < 0 ? 0 : (ctx.values[idx] ?? 0);
}

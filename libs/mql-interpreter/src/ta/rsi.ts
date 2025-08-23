import type { ExecutionContext } from "../libs/domain/types";
import type { IndicatorEngine } from "../libs/domain/indicator";
import { candlesFor, priceVal } from "./utils";

export function iRSI(
  context: ExecutionContext,
  symbol: string,
  timeframe: number,
  period: number,
  applied: number,
  shift: number
): number {
  const arr = candlesFor(context, symbol, timeframe);
  const curIdx = arr.length - 1;
  const engine: IndicatorEngine | undefined = context.indicatorEngine ?? undefined;
  if (!engine) return 0;

  const key = {
    type: "iRSI",
    symbol,
    timeframe,
    params: { period, applied },
  } as const;

  const ctx = engine.getOrCreate(key, () => ({
    last: -1,
    values: [] as number[],
    gains: [] as number[],
    losses: [] as number[],
  }));

  if (ctx.last < 0 && curIdx >= 0) {
    ctx.values[0] = 0;
    ctx.gains[0] = 0;
    ctx.losses[0] = 0;
    ctx.last = 0;
  }

  if (ctx.last < curIdx) {
    for (let i = ctx.last + 1; i <= curIdx; i++) {
      const price = priceVal(arr[i], applied);
      const prev = priceVal(arr[i - 1], applied);
      const diff = price - prev;
      ctx.gains[i] = diff > 0 ? diff : 0;
      ctx.losses[i] = diff < 0 ? -diff : 0;
      if (i < period) {
        ctx.values[i] = 0;
      } else {
        let gains = 0;
        let losses = 0;
        for (let j = i - period + 1; j <= i; j++) {
          gains += ctx.gains[j];
          losses += ctx.losses[j];
        }
        const avgGain = gains / period;
        const avgLoss = losses / period;
        if (avgLoss === 0) ctx.values[i] = 100;
        else if (avgGain === 0) ctx.values[i] = 0;
        else {
          const rs = avgGain / avgLoss;
          ctx.values[i] = 100 - 100 / (1 + rs);
        }
      }
      ctx.last = i;
    }
  }

  const idx = arr.length - 1 - shift;
  return idx < 0 ? 0 : (ctx.values[idx] ?? 0);
}

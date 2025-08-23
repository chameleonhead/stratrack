import type { ExecutionContext } from "../libs/domain/types";
import type { IndicatorEngine } from "../libs/domain/indicator";
import { candlesFor, priceVal } from "./utils";

export function iMACD(
  context: ExecutionContext,
  symbol: string,
  timeframe: number,
  fast: number,
  slow: number,
  signal: number,
  applied: number,
  mode: number,
  shift: number
): number {
  const arr = candlesFor(context, symbol, timeframe);
  const curIdx = arr.length - 1;
  const engine: IndicatorEngine | undefined = context.indicatorEngine ?? undefined;
  if (!engine) return 0;

  const key = {
    type: "iMACD",
    symbol,
    timeframe,
    params: { fast, slow, signal, applied },
  } as const;

  const ctx = engine.getOrCreate(key, () => ({
    last: -1,
    macd: [] as number[],
    signal: [] as number[],
    hist: [] as number[],
    emaFast: 0,
    emaSlow: 0,
    sig: 0,
  }));

  const kFast = 2 / (fast + 1);
  const kSlow = 2 / (slow + 1);
  const kSig = 2 / (signal + 1);

  if (ctx.last < 0 && curIdx >= 0) {
    const price0 = priceVal(arr[0], applied);
    ctx.emaFast = price0;
    ctx.emaSlow = price0;
    ctx.sig = 0;
    ctx.macd[0] = 0;
    ctx.signal[0] = 0;
    ctx.hist[0] = 0;
    ctx.last = 0;
  }

  if (ctx.last < curIdx) {
    for (let i = ctx.last + 1; i <= curIdx; i++) {
      const price = priceVal(arr[i], applied);
      ctx.emaFast = kFast * price + (1 - kFast) * ctx.emaFast;
      ctx.emaSlow = kSlow * price + (1 - kSlow) * ctx.emaSlow;
      const macd = ctx.emaFast - ctx.emaSlow;
      ctx.macd[i] = macd;
      ctx.sig = kSig * macd + (1 - kSig) * ctx.sig;
      ctx.signal[i] = ctx.sig;
      ctx.hist[i] = macd - ctx.sig;
      ctx.last = i;
    }
  }

  const idx = arr.length - 1 - shift;
  switch (mode) {
    case 0:
      return idx < 0 ? 0 : (ctx.macd[idx] ?? 0);
    case 1:
      return idx < 0 ? 0 : (ctx.signal[idx] ?? 0);
    case 2:
      return idx < 0 ? 0 : (ctx.hist[idx] ?? 0);
    default:
      return 0;
  }
}

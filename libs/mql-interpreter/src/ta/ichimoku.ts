import type { ExecutionContext } from "../libs/domain/types";
import type { IndicatorEngine } from "../libs/domain/indicator";
import { candlesFor } from "./utils";

export function iIchimoku(
  context: ExecutionContext,
  symbol: string,
  timeframe: number,
  tenkan: number,
  kijun: number,
  senkouSpanB: number,
  mode: number,
  shift: number
): number {
  const candles = candlesFor(context, symbol, timeframe);
  const curIdx = candles.length - 1;
  const engine: IndicatorEngine | undefined = context.indicatorEngine ?? undefined;
  if (!engine) return 0;

  const key = {
    type: "iIchimoku",
    symbol,
    timeframe,
    params: { tenkan, kijun, senkouSpanB },
  } as const;

  const ctx = engine.getOrCreate(key, () => ({
    last: -1,
    tenkanVals: [] as number[],
    kijunVals: [] as number[],
    spanA: [] as number[],
    spanB: [] as number[],
    chikou: [] as number[],
  }));

  if (ctx.last < curIdx) {
    for (let i = ctx.last + 1; i <= curIdx; i++) {
      // Tenkan-sen
      if (i >= tenkan - 1) {
        let high = -Infinity;
        let low = Infinity;
        for (let j = i - tenkan + 1; j <= i; j++) {
          const c = candles[j];
          if (c.high > high) high = c.high;
          if (c.low < low) low = c.low;
        }
        ctx.tenkanVals[i] = (high + low) / 2;
      } else {
        ctx.tenkanVals[i] = 0;
      }

      // Kijun-sen
      if (i >= kijun - 1) {
        let high = -Infinity;
        let low = Infinity;
        for (let j = i - kijun + 1; j <= i; j++) {
          const c = candles[j];
          if (c.high > high) high = c.high;
          if (c.low < low) low = c.low;
        }
        ctx.kijunVals[i] = (high + low) / 2;
      } else {
        ctx.kijunVals[i] = 0;
      }

      // Senkou Span A
      if (ctx.tenkanVals[i] && ctx.kijunVals[i]) {
        ctx.spanA[i + kijun] = (ctx.tenkanVals[i] + ctx.kijunVals[i]) / 2;
      }

      // Senkou Span B
      if (i >= senkouSpanB - 1) {
        let high = -Infinity;
        let low = Infinity;
        for (let j = i - senkouSpanB + 1; j <= i; j++) {
          const c = candles[j];
          if (c.high > high) high = c.high;
          if (c.low < low) low = c.low;
        }
        ctx.spanB[i + kijun] = (high + low) / 2;
      }

      // Chikou Span
      if (i - kijun >= 0) {
        ctx.chikou[i - kijun] = candles[i].close;
      }

      ctx.last = i;
    }
  }

  const base = candles.length - 1 - shift;
  switch (mode) {
    case 0:
      return base < 0 ? 0 : (ctx.tenkanVals[base] ?? 0);
    case 1:
      return base < 0 ? 0 : (ctx.kijunVals[base] ?? 0);
    case 2: {
      const idx = base + kijun;
      return idx < 0 ? 0 : (ctx.spanA[idx] ?? 0);
    }
    case 3: {
      const idx = base + kijun;
      return idx < 0 ? 0 : (ctx.spanB[idx] ?? 0);
    }
    case 4:
      return base < 0 ? 0 : (ctx.chikou[base] ?? 0);
    default:
      return 0;
  }
}

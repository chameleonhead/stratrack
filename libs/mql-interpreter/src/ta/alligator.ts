import type { ExecutionContext } from "../libs/domain/types";
import type { IndicatorEngine } from "../libs/domain/indicator";
import { candlesFor, priceVal } from "./utils";

export function iAlligator(
  context: ExecutionContext,
  symbol: string,
  timeframe: number,
  jawPeriod: number,
  jawShift: number,
  teethPeriod: number,
  teethShift: number,
  lipsPeriod: number,
  lipsShift: number,
  maMethod: number,
  appliedPrice: number,
  mode: number,
  shift: number
): number {
  const candles = candlesFor(context, symbol, timeframe);
  const curIdx = candles.length - 1;
  const engine: IndicatorEngine | undefined = context.indicatorEngine ?? undefined;
  if (!engine) return 0;

  const key = {
    type: "iAlligator",
    symbol,
    timeframe,
    params: { jawPeriod, teethPeriod, lipsPeriod, maMethod, appliedPrice },
  } as const;

  const ctx = engine.getOrCreate(key, () => ({
    last: -1,
    jaw: [] as number[],
    teeth: [] as number[],
    lips: [] as number[],
    jawSum: 0,
    teethSum: 0,
    lipsSum: 0,
  }));

  if (ctx.last < curIdx) {
    for (let i = ctx.last + 1; i <= curIdx; i++) {
      const price = priceVal(candles[i], appliedPrice);

      // Jaw SMMA
      if (i < jawPeriod) {
        ctx.jawSum += price;
        if (i === jawPeriod - 1) ctx.jaw[i] = ctx.jawSum / jawPeriod;
        else ctx.jaw[i] = 0;
      } else {
        const prev = ctx.jaw[i - 1] ?? ctx.jawSum / jawPeriod;
        ctx.jaw[i] = (prev * (jawPeriod - 1) + price) / jawPeriod;
      }

      // Teeth SMMA
      if (i < teethPeriod) {
        ctx.teethSum += price;
        if (i === teethPeriod - 1) ctx.teeth[i] = ctx.teethSum / teethPeriod;
        else ctx.teeth[i] = 0;
      } else {
        const prev = ctx.teeth[i - 1] ?? ctx.teethSum / teethPeriod;
        ctx.teeth[i] = (prev * (teethPeriod - 1) + price) / teethPeriod;
      }

      // Lips SMMA
      if (i < lipsPeriod) {
        ctx.lipsSum += price;
        if (i === lipsPeriod - 1) ctx.lips[i] = ctx.lipsSum / lipsPeriod;
        else ctx.lips[i] = 0;
      } else {
        const prev = ctx.lips[i - 1] ?? ctx.lipsSum / lipsPeriod;
        ctx.lips[i] = (prev * (lipsPeriod - 1) + price) / lipsPeriod;
      }

      ctx.last = i;
    }
  }

  const base = candles.length - 1 - shift;
  switch (mode) {
    case 0: {
      const idx = base - jawShift;
      return idx < 0 ? 0 : (ctx.jaw[idx] ?? 0);
    }
    case 1: {
      const idx = base - teethShift;
      return idx < 0 ? 0 : (ctx.teeth[idx] ?? 0);
    }
    case 2: {
      const idx = base - lipsShift;
      return idx < 0 ? 0 : (ctx.lips[idx] ?? 0);
    }
    default:
      return 0;
  }
}

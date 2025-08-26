import type { ExecutionContext } from "../libs/domain/types";
import type { IndicatorEngine } from "../libs/domain/indicator";
import { candlesFor, priceVal } from "./utils";

export function iMA(
  context: ExecutionContext,
  symbol: string,
  timeframe: number,
  period: number,
  maShift: number,
  maMethod: number,
  applied: number,
  shift: number
): number {
  const arr = candlesFor(context, symbol, timeframe);
  const curIdx = arr.length - 1;
  const engine: IndicatorEngine | undefined = context.indicatorEngine ?? undefined;
  if (!engine) return 0;

  const key = {
    type: "iMA",
    symbol,
    timeframe,
    params: { period, maMethod, applied },
  } as const;

  const ctx = engine.getOrCreate(key, () => ({
    last: -1,
    values: [] as number[],
    sum: 0,
  }));

  if (ctx.last < curIdx) {
    for (let i = ctx.last + 1; i <= curIdx; i++) {
      const price = priceVal(arr[i], applied);
      switch (maMethod) {
        case 0: {
          ctx.sum += price;
          if (i >= period) ctx.sum -= priceVal(arr[i - period], applied);
          ctx.values[i] = i >= period - 1 ? ctx.sum / period : 0;
          break;
        }
        case 1: {
          const prev = i === 0 ? price : ctx.values[i - 1];
          const k = 2 / (period + 1);
          ctx.values[i] = prev + k * (price - prev);
          break;
        }
        case 2: {
          if (i === 0) {
            ctx.values[i] = price;
            ctx.sum = price;
          } else if (i < period) {
            ctx.sum += price;
            ctx.values[i] = ctx.sum / (i + 1);
          } else {
            const prev = ctx.values[i - 1] ?? price;
            ctx.values[i] = ((period - 1) * prev + price) / period;
          }
          break;
        }
        case 3: {
          if (i < period - 1) {
            ctx.values[i] = 0;
          } else {
            let num = 0;
            for (let j = 0; j < period; j++) {
              num += priceVal(arr[i - j], applied) * (period - j);
            }
            ctx.values[i] = num / ((period * (period + 1)) / 2);
          }
          break;
        }
        default:
          ctx.values[i] = 0;
      }
      ctx.last = i;
    }
  }

  const idx = arr.length - 1 - (shift + maShift);
  return idx < 0 ? 0 : (ctx.values[idx] ?? 0);
}

export function iMAOnArray(
  array: number[],
  total: number,
  period: number,
  maShift: number,
  maMethod: number,
  shift: number
): number {
  const idx = total - 1 - (shift + maShift);
  if (idx < 0) return 0;

  switch (maMethod) {
    case 0: {
      if (idx - period + 1 < 0) return 0;
      let sum = 0;
      for (let i = idx - period + 1; i <= idx; i++) sum += array[i];
      return sum / period;
    }
    case 1: {
      const k = 2 / (period + 1);
      let ema = array[0];
      for (let i = 1; i <= idx; i++) {
        ema = ema + k * (array[i] - ema);
      }
      return ema;
    }
    case 2: {
      let smma = array[0];
      let sum = array[0];
      for (let i = 1; i <= idx; i++) {
        const price = array[i];
        if (i < period) {
          sum += price;
          smma = sum / (i + 1);
        } else {
          smma = (smma * (period - 1) + price) / period;
        }
      }
      return smma;
    }
    case 3: {
      if (idx - period + 1 < 0) return 0;
      let num = 0;
      for (let j = 0; j < period; j++) {
        num += array[idx - j] * (period - j);
      }
      return num / ((period * (period + 1)) / 2);
    }
    default:
      return 0;
  }
}

import type { ExecutionContext } from "../libs/domain/types";
import { iMA, iMAOnArray } from "./ma";

export function iEnvelopes(
  context: ExecutionContext,
  symbol: string,
  timeframe: number,
  maPeriod: number,
  maShift: number,
  maMethod: number,
  appliedPrice: number,
  deviation: number,
  mode: number,
  shift: number
): number {
  const ma = iMA(context, symbol, timeframe, maPeriod, maShift, maMethod, appliedPrice, shift);
  switch (mode) {
    case 1:
      return ma * (1 + deviation / 100);
    case 2:
      return ma * (1 - deviation / 100);
    default:
      return ma;
  }
}

export function iEnvelopesOnArray(
  array: number[],
  total: number,
  maPeriod: number,
  maShift: number,
  maMethod: number,
  deviation: number,
  mode: number,
  shift: number
): number {
  const ma = iMAOnArray(array, total, maPeriod, maShift, maMethod, shift);
  switch (mode) {
    case 1:
      return ma * (1 + deviation / 100);
    case 2:
      return ma * (1 - deviation / 100);
    default:
      return ma;
  }
}

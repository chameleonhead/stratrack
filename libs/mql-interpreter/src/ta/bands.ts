import type { ExecutionContext } from "../libs/domain/types";
import { iMA, iMAOnArray } from "./ma";
import { iStdDev, iStdDevOnArray } from "./stddev";

export function iBands(
  context: ExecutionContext,
  symbol: string,
  timeframe: number,
  period: number,
  deviation: number,
  bandsShift: number,
  appliedPrice: number,
  mode: number,
  shift: number
): number {
  const ma = iMA(context, symbol, timeframe, period, bandsShift, 0, appliedPrice, shift);
  const sd = iStdDev(context, symbol, timeframe, period, bandsShift, 0, appliedPrice, shift);
  switch (mode) {
    case 0:
      return ma + deviation * sd;
    case 1:
      return ma - deviation * sd;
    default:
      return ma;
  }
}

export function iBandsOnArray(
  array: number[],
  total: number,
  period: number,
  deviation: number,
  bandsShift: number,
  mode: number,
  shift: number
): number {
  const ma = iMAOnArray(array, total, period, bandsShift, 0, shift);
  const sd = iStdDevOnArray(array, total, period, bandsShift, 0, shift);
  switch (mode) {
    case 0:
      return ma + deviation * sd;
    case 1:
      return ma - deviation * sd;
    default:
      return ma;
  }
}

import type { ExecutionContext } from "../libs/domain/types";
import { iAlligator } from "./alligator";

export function iGator(
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
  const jaw = iAlligator(
    context,
    symbol,
    timeframe,
    jawPeriod,
    jawShift,
    teethPeriod,
    teethShift,
    lipsPeriod,
    lipsShift,
    maMethod,
    appliedPrice,
    0,
    shift
  );
  const teeth = iAlligator(
    context,
    symbol,
    timeframe,
    jawPeriod,
    jawShift,
    teethPeriod,
    teethShift,
    lipsPeriod,
    lipsShift,
    maMethod,
    appliedPrice,
    1,
    shift
  );
  const lips = iAlligator(
    context,
    symbol,
    timeframe,
    jawPeriod,
    jawShift,
    teethPeriod,
    teethShift,
    lipsPeriod,
    lipsShift,
    maMethod,
    appliedPrice,
    2,
    shift
  );
  if (mode === 0) return Math.abs(jaw - teeth);
  if (mode === 1) return -Math.abs(teeth - lips);
  return 0;
}

import type { BuiltinFunction } from '../types';

export const NormalizeDouble: BuiltinFunction = (value: number, digits: number) => {
  return parseFloat(value.toFixed(digits));
};


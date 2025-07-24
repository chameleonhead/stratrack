import type { BuiltinFunction } from '../types';

export const CharToString: BuiltinFunction = (ch: number | string) => {
  if (typeof ch === 'number') return String.fromCharCode(ch);
  return ch.charAt(0);
};

export const StringToTime: BuiltinFunction = (s: string) => {
  const t = Date.parse(s);
  return isNaN(t) ? 0 : Math.floor(t / 1000);
};

export const NormalizeDouble: BuiltinFunction = (value: number, digits: number) => {
  return parseFloat(value.toFixed(digits));
};

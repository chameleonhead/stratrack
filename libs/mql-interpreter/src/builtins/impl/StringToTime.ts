import type { BuiltinFunction } from '../types';

export const StringToTime: BuiltinFunction = (s: string) => {
  const t = Date.parse(s);
  return isNaN(t) ? 0 : Math.floor(t / 1000);
};


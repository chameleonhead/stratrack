import type { BuiltinFunction } from '../types';

export const CharToString: BuiltinFunction = (ch: number | string) => {
  if (typeof ch === 'number') return String.fromCharCode(ch);
  return ch.charAt(0);
};


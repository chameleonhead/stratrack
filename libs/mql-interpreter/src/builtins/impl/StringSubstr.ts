import type { BuiltinFunction } from '../types';

export const StringSubstr: BuiltinFunction = (
  s: string,
  start: number,
  len?: number,
) => s.substr(start, len);


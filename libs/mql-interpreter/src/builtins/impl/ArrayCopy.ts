import type { BuiltinFunction } from '../types';

export const ArrayCopy: BuiltinFunction = (
  dst: any[],
  src: any[],
  start = 0,
  count = src.length - start,
) => {
  for (let i = 0; i < count && start + i < src.length; i++) {
    dst[i] = src[start + i];
  }
  return count;
};


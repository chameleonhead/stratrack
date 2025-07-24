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

export const ArrayResize: BuiltinFunction = (
  arr: any[],
  newSize: number,
  defaultValue?: any,
) => {
  if (newSize < 0) throw new Error('newSize must be >= 0');
  if (arr.length > newSize) {
    arr.length = newSize;
  } else {
    while (arr.length < newSize) arr.push(defaultValue);
  }
  return arr.length;
};

export const ArraySetAsSeries: BuiltinFunction = (arr: any[], asSeries: boolean) => {
  (arr as any).__asSeries = !!asSeries;
  return 0;
};

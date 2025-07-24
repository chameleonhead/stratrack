import type { BuiltinFunction } from '../types';

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

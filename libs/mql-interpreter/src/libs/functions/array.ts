import type { BuiltinFunction } from "./types";

export const ArrayCopy: BuiltinFunction = (
  dst: any[],
  src: any[],
  start = 0,
  count = src.length - start
) => {
  for (let i = 0; i < count && start + i < src.length; i++) {
    dst[i] = src[start + i];
  }
  return count;
};

export const ArrayResize: BuiltinFunction = (arr: any[], newSize: number, defaultValue?: any) => {
  if (newSize < 0) throw new Error("newSize must be >= 0");
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

export const ArrayGetAsSeries: BuiltinFunction = (arr: any[]) => {
  return (arr as any).__asSeries ? 1 : 0;
};

export const ArrayIsSeries: BuiltinFunction = (arr: any[]) => {
  return (arr as any).__asSeries ? 1 : 0;
};

export const ArrayIsDynamic: BuiltinFunction = () => 1;

export const ArraySize: BuiltinFunction = (arr: any[]) => {
  if (!arr || !Array.isArray(arr)) return 0;
  return arr.length;
};

export const ArrayRange: BuiltinFunction = (arr: any[], dimension: number) => {
  if (!arr || !Array.isArray(arr)) return 0;
  let cur: any = arr;
  for (let i = 0; i < dimension; i++) {
    if (Array.isArray(cur) && cur.length) cur = cur[0];
    else return 0;
  }
  return Array.isArray(cur) ? cur.length : 0;
};

export const ArrayDimension: BuiltinFunction = (arr: any[]) => {
  if (!arr || !Array.isArray(arr)) return 0;
  let dim = 0;
  let cur: any = arr;
  while (Array.isArray(cur)) {
    dim++;
    cur = cur[0];
  }
  return dim;
};

export const ArrayFree: BuiltinFunction = (arr: any[]) => {
  arr.length = 0;
  return 0;
};

export const ArrayInitialize: BuiltinFunction = (arr: any[], value: any) => {
  for (let i = 0; i < arr.length; i++) arr[i] = value;
  return arr.length;
};

export const ArrayFill: BuiltinFunction = (
  arr: any[],
  start: number,
  count: number,
  value: any
) => {
  for (let i = 0; i < count && start + i < arr.length; i++) {
    arr[start + i] = value;
  }
  return count;
};

export const ArraySort: BuiltinFunction = (arr: any[], dir = 0) => {
  arr.sort((a, b) => (dir === 1 ? b - a : a - b));
  return 0;
};

export const ArrayMaximum: BuiltinFunction = (
  arr: number[],
  start = 0,
  count = arr.length - start
) => {
  let maxIdx = start;
  for (let i = 1; i < count && start + i < arr.length; i++) {
    if (arr[start + i] > arr[maxIdx]) maxIdx = start + i;
  }
  return maxIdx;
};

export const ArrayMinimum: BuiltinFunction = (
  arr: number[],
  start = 0,
  count = arr.length - start
) => {
  let minIdx = start;
  for (let i = 1; i < count && start + i < arr.length; i++) {
    if (arr[start + i] < arr[minIdx]) minIdx = start + i;
  }
  return minIdx;
};

export const ArrayBsearch: BuiltinFunction = (
  arr: number[],
  value: number,
  count = arr.length,
  start = 0
) => {
  let lo = start;
  let hi = start + count - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const v = arr[mid];
    if (v === value) return mid;
    if (v < value) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
};

export const ArrayCompare: BuiltinFunction = (
  arr1: any[],
  arr2: any[],
  start1 = 0,
  start2 = 0,
  len = Math.min(arr1.length - start1, arr2.length - start2)
) => {
  for (let i = 0; i < len; i++) {
    if (arr1[start1 + i] < arr2[start2 + i]) return -1;
    if (arr1[start1 + i] > arr2[start2 + i]) return 1;
  }
  if (arr1.length - start1 < arr2.length - start2) return -1;
  if (arr1.length - start1 > arr2.length - start2) return 1;
  return 0;
};

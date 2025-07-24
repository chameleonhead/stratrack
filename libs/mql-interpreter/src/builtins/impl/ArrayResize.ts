import type { BuiltinFunction } from '../types';
import { resizeArray } from '../../resizeArray';

export const ArrayResize: BuiltinFunction = (arr: any[], newSize: number) => {
  resizeArray(arr, newSize);
  return arr.length;
};

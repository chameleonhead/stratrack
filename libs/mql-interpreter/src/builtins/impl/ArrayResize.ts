import type { BuiltinFunction } from '../types';
import { ArrayResize as ArrayResizeHelper } from '../../arrayResize';

export const ArrayResize: BuiltinFunction = (arr: any[], newSize: number) => {
  ArrayResizeHelper(arr, newSize);
  return arr.length;
};

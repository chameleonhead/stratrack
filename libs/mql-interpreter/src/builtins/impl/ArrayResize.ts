import type { BuiltinFunction } from '../types';
import { ArrayResize as arrayResize } from './helpers/arrayResize';

export const ArrayResize: BuiltinFunction = (arr: any[], newSize: number) => {
  arrayResize(arr, newSize);
  return arr.length;
};

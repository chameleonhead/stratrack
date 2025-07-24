import type { BuiltinFunction } from '../types';

export const Comment: BuiltinFunction = (...args: any[]) => {
  console.log(...args);
  return 0;
};


import type { BuiltinFunction } from '../types';

export const Sleep: BuiltinFunction = (ms: number) => {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    // busy wait
  }
  return 0;
};


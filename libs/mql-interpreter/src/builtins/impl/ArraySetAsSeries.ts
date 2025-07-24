import type { BuiltinFunction } from '../types';

export const ArraySetAsSeries: BuiltinFunction = (arr: any[], asSeries: boolean) => {
  (arr as any).__asSeries = !!asSeries;
  return 0;
};


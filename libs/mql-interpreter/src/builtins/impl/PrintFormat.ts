import { format } from 'util';
import type { BuiltinFunction } from '../types';

export const PrintFormat: BuiltinFunction = (fmt: string, ...args: any[]) => {
  console.log(format(fmt, ...args));
  return 0;
};


import type { BuiltinFunction } from '../types';
import { format } from 'util';

export const Print: BuiltinFunction = (...args: any[]) => {
  console.log(...args);
  return 0;
};

export const Alert: BuiltinFunction = (...args: any[]) => {
  console.log(...args);
  return true;
};

export const Comment: BuiltinFunction = (...args: any[]) => {
  console.log(...args);
  return 0;
};

export const PrintFormat: BuiltinFunction = (fmt: string, ...args: any[]) => {
  console.log(format(fmt, ...args));
  return 0;
};

export const GetTickCount: BuiltinFunction = () => Date.now();

export const Sleep: BuiltinFunction = (ms: number) => {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    // busy wait
  }
  return 0;
};

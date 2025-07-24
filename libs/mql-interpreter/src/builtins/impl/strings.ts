import type { BuiltinFunction } from '../types';

export const StringTrimLeft: BuiltinFunction = (str: { value: string }) => {
  str.value = str.value.replace(/^\s+/, '');
  return str.value.length;
};

export const StringTrimRight: BuiltinFunction = (str: { value: string }) => {
  str.value = str.value.replace(/\s+$/, '');
  return str.value.length;
};

export const StringLen: BuiltinFunction = (s: string) => s.length;

export const StringSubstr: BuiltinFunction = (
  s: string,
  start: number,
  len?: number,
) => s.substr(start, len);

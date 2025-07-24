import type { BuiltinFunction } from '../types';

export const StringTrimRight: BuiltinFunction = (str: { value: string }) => {
  str.value = str.value.replace(/\s+$/, '');
  return str.value.length;
};


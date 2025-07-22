import { builtinNames } from './stubNames';
import * as impl from './impl';
import type { BuiltinFunction } from './types';

export type { BuiltinFunction } from './types';

const noop: BuiltinFunction = () => 0;

const builtins: Record<string, BuiltinFunction> = { ...impl };

for (const name of builtinNames) {
  if (!builtins[name]) builtins[name] = noop;
}

export function getBuiltin(name: string): BuiltinFunction | undefined {
  return builtins[name];
}

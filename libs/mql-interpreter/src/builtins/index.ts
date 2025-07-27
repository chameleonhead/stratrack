import { builtinNames } from "./stubNames";
import { coreBuiltins, envBuiltins } from "./impl";
export { builtinSignatures } from "./signatures";
import type { BuiltinFunction } from "./types";

export type { BuiltinFunction } from "./types";

const noop: BuiltinFunction = () => 0;

let customEnvBuiltins: Record<string, BuiltinFunction> = {};

export function registerEnvBuiltins(map: Record<string, BuiltinFunction>): void {
  customEnvBuiltins = { ...customEnvBuiltins, ...map };
}

const stubBuiltins: Record<string, BuiltinFunction> = {};
for (const name of builtinNames) {
  stubBuiltins[name] = noop;
}

export function getBuiltin(name: string): BuiltinFunction | undefined {
  return customEnvBuiltins[name] || envBuiltins[name] || coreBuiltins[name] || stubBuiltins[name];
}

export { coreBuiltins, envBuiltins };

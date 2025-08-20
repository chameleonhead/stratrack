import { coreBuiltins, envBuiltins } from "./registry";
import type { BuiltinFunction } from "./types";

let customEnvBuiltins: Record<string, BuiltinFunction> = {};

export function registerEnvBuiltins(map: Record<string, BuiltinFunction>): void {
  customEnvBuiltins = { ...customEnvBuiltins, ...map };
}

export function getBuiltin(name: string): BuiltinFunction | undefined {
  return customEnvBuiltins[name] || envBuiltins[name] || coreBuiltins[name];
}

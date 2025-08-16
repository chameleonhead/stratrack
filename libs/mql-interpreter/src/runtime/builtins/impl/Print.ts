import type { BuiltinFunction } from "../types.js";

export const Print: BuiltinFunction = (...args: any[]) => {
  console.log(...args);
  return 0;
};

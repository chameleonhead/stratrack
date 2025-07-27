import type { BuiltinFunction } from "../types";

export const Print: BuiltinFunction = (...args: any[]) => {
  console.log(...args);
  return 0;
};

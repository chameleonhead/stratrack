import type { BuiltinFunction } from "../types.js";

export const Alert: BuiltinFunction = (...args: any[]) => {
  console.log(...args);
  return true;
};

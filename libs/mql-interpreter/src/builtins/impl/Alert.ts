import type { BuiltinFunction } from "../types";

export const Alert: BuiltinFunction = (...args: any[]) => {
  console.log(...args);
  return true;
};

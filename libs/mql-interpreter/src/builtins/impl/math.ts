import type { BuiltinFunction } from "../types.js";

export const MathAbs: BuiltinFunction = (v: number) => Math.abs(v);
export const MathArccos: BuiltinFunction = (v: number) => Math.acos(v);
export const MathArcsin: BuiltinFunction = (v: number) => Math.asin(v);
export const MathArctan: BuiltinFunction = (v: number) => Math.atan(v);
export const MathCeil: BuiltinFunction = (v: number) => Math.ceil(v);
export const MathCos: BuiltinFunction = (v: number) => Math.cos(v);
export const MathExp: BuiltinFunction = (v: number) => Math.exp(v);
export const MathFloor: BuiltinFunction = (v: number) => Math.floor(v);
export const MathLog: BuiltinFunction = (v: number) => Math.log(v);
export const MathLog10: BuiltinFunction = (v: number) => Math.log(v) / Math.LN10;
export const MathMax: BuiltinFunction = (a: number, b: number) => Math.max(a, b);
export const MathMin: BuiltinFunction = (a: number, b: number) => Math.min(a, b);
export const MathMod: BuiltinFunction = (a: number, b: number) => a - Math.floor(a / b) * b;
export const MathPow: BuiltinFunction = (a: number, b: number) => Math.pow(a, b);
let randSeed = Date.now() & 0x7fffffff;
export const MathRand: BuiltinFunction = () => {
  randSeed = (214013 * randSeed + 2531011) >>> 0;
  return (randSeed >>> 16) & 0x7fff;
};
export const MathRound: BuiltinFunction = (v: number) => Math.round(v);
export const MathSin: BuiltinFunction = (v: number) => Math.sin(v);
export const MathSqrt: BuiltinFunction = (v: number) => Math.sqrt(v);
export const MathSrand: BuiltinFunction = (seed: number) => {
  randSeed = seed >>> 0;
  return 0;
};
export const MathTan: BuiltinFunction = (v: number) => Math.tan(v);
export const MathIsValidNumber: BuiltinFunction = (v: number) => (isFinite(v) ? 1 : 0);

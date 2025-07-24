import type { BuiltinFunction } from '../types';

export const MathAbs: BuiltinFunction = (v: number) => Math.abs(v);
export const MathPow: BuiltinFunction = (a: number, b: number) => Math.pow(a, b);
export const MathSqrt: BuiltinFunction = (v: number) => Math.sqrt(v);

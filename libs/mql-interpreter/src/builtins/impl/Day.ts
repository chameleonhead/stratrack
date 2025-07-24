import type { BuiltinFunction } from '../types';

export const Day: BuiltinFunction = (t: number) => new Date(t * 1000).getDate();


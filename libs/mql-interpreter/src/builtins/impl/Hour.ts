import type { BuiltinFunction } from '../types';

export const Hour: BuiltinFunction = (t: number) => new Date(t * 1000).getHours();


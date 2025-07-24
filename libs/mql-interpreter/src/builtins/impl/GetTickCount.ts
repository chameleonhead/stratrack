import type { BuiltinFunction } from '../types';

export const GetTickCount: BuiltinFunction = () => Date.now();


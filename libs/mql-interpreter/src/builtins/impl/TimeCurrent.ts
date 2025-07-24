import type { BuiltinFunction } from '../types';

export const TimeCurrent: BuiltinFunction = () => Math.floor(Date.now() / 1000);


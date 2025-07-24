import type { BuiltinFunction } from '../types';

export const TimeToStruct: BuiltinFunction = (t: number) => {
  const d = new Date(t * 1000);
  return {
    year: d.getFullYear(),
    mon: d.getMonth() + 1,
    day: d.getDate(),
    hour: d.getHours(),
    min: d.getMinutes(),
    sec: d.getSeconds(),
  };
};


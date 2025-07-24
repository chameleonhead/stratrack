import type { BuiltinFunction } from '../types';

export const Day: BuiltinFunction = (t: number) => new Date(t * 1000).getDate();
export const Hour: BuiltinFunction = (t: number) => new Date(t * 1000).getHours();
export const TimeCurrent: BuiltinFunction = () => Math.floor(Date.now() / 1000);
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

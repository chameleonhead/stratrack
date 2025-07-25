import type { BuiltinFunction } from '../types';

const toDate = (t?: number) => (t === undefined ? new Date() : new Date(t * 1000));

export const Day: BuiltinFunction = (t?: number) => toDate(t).getDate();
export const DayOfWeek: BuiltinFunction = (t?: number) => toDate(t).getDay();
export const DayOfYear: BuiltinFunction = (t?: number) => {
  const d = toDate(t);
  const start = Date.UTC(d.getFullYear(), 0, 1);
  return Math.floor((d.getTime() - start) / 86400000) + 1;
};

export const Hour: BuiltinFunction = (t?: number) => toDate(t).getHours();
export const Minute: BuiltinFunction = (t?: number) => toDate(t).getMinutes();
export const Month: BuiltinFunction = (t?: number) => toDate(t).getMonth() + 1;
export const Seconds: BuiltinFunction = (t?: number) => toDate(t).getSeconds();
export const Year: BuiltinFunction = (t?: number) => toDate(t).getFullYear();

export const TimeCurrent: BuiltinFunction = () => Math.floor(Date.now() / 1000);
export const TimeLocal: BuiltinFunction = TimeCurrent;
export const TimeGMT: BuiltinFunction = () =>
  Math.floor(Date.now() / 1000) - new Date().getTimezoneOffset() * 60;
export const TimeDaylightSavings: BuiltinFunction = () => {
  const now = new Date();
  const jan = new Date(now.getFullYear(), 0, 1);
  const jul = new Date(now.getFullYear(), 6, 1);
  const std = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
  return now.getTimezoneOffset() < std ? 1 : 0;
};
export const TimeGMTOffset: BuiltinFunction = () =>
  -new Date().getTimezoneOffset() * 60;

export const TimeToStruct: BuiltinFunction = (t: number) => {
  const d = new Date(t * 1000);
  return {
    year: d.getFullYear(),
    mon: d.getMonth() + 1,
    day: d.getDate(),
    hour: d.getHours(),
    min: d.getMinutes(),
    sec: d.getSeconds(),
    day_of_week: d.getDay(),
    day_of_year:
      Math.floor((d.getTime() - Date.UTC(d.getFullYear(), 0, 1)) / 86400000) + 1,
  };
};

export const StructToTime: BuiltinFunction = (s: {
  year: number;
  mon: number;
  day: number;
  hour?: number;
  min?: number;
  sec?: number;
}) => {
  const date = new Date(
    s.year,
    (s.mon || 1) - 1,
    s.day,
    s.hour || 0,
    s.min || 0,
    s.sec || 0
  );
  return Math.floor(date.getTime() / 1000);
};

export const TimeDay: BuiltinFunction = (t: number) => Day(t);
export const TimeDayOfWeek: BuiltinFunction = (t: number) => DayOfWeek(t);
export const TimeDayOfYear: BuiltinFunction = (t: number) => DayOfYear(t);
export const TimeHour: BuiltinFunction = (t: number) => Hour(t);
export const TimeMinute: BuiltinFunction = (t: number) => Minute(t);
export const TimeMonth: BuiltinFunction = (t: number) => Month(t);
export const TimeSeconds: BuiltinFunction = (t: number) => Seconds(t);
export const TimeYear: BuiltinFunction = (t: number) => Year(t);

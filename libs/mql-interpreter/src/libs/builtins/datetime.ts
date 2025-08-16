import type { BuiltinFunction } from "./types";
import { DateTimeValue } from "../../runtime/datetimeValue";

const toDate = (t?: number) => (t === undefined ? new Date() : new Date(Number(t) * 1000));

export const Day: BuiltinFunction = (t?: number) => toDate(t).getUTCDate();
export const DayOfWeek: BuiltinFunction = (t?: number) => toDate(t).getUTCDay();
export const DayOfYear: BuiltinFunction = (t?: number) => {
  const d = toDate(t);
  const start = Date.UTC(d.getUTCFullYear(), 0, 1);
  return Math.ceil((d.getTime() - start) / 86400000);
};

export const Hour: BuiltinFunction = (t?: number) => toDate(t).getUTCHours();
export const Minute: BuiltinFunction = (t?: number) => toDate(t).getUTCMinutes();
export const Month: BuiltinFunction = (t?: number) => toDate(t).getUTCMonth() + 1;
export const Seconds: BuiltinFunction = (t?: number) => toDate(t).getUTCSeconds();
export const Year: BuiltinFunction = (t?: number) => toDate(t).getUTCFullYear();

const now = () => Math.floor(Date.now() / 1000);

export const TimeCurrent: BuiltinFunction = () => new DateTimeValue(now());
export const TimeLocal: BuiltinFunction = () => new DateTimeValue(now() + TimeGMTOffset());
export const TimeGMT: BuiltinFunction = () =>
  new DateTimeValue(TimeDaylightSavings() === 0 ? now() : now() - 3600);
export const TimeDaylightSavings: BuiltinFunction = () => {
  // Get current time in UTC
  const utc = new Date().toLocaleString("en-US", {
    timeZone: "UTC",
    timeStyle: "short",
    hourCycle: "h23",
  });
  const [utchours] = utc.split(":").map(Number);
  // Get current time in GMT (London timezone)
  const gmt = new Date().toLocaleString("en-US", {
    timeZone: "Europe/London",
    timeStyle: "short",
    hourCycle: "h23",
  });
  const [gmthours] = gmt.split(":").map(Number);
  return utchours === gmthours ? 0 : 1;
};
export const TimeGMTOffset: BuiltinFunction = () => -new Date().getTimezoneOffset() * 60;

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
    day_of_year: Math.floor((d.getTime() - Date.UTC(d.getFullYear(), 0, 1)) / 86400000) + 1,
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
  const date = new Date(s.year, (s.mon || 1) - 1, s.day, s.hour || 0, s.min || 0, s.sec || 0);
  return new DateTimeValue(Math.floor(date.getTime() / 1000));
};

export const TimeDay: BuiltinFunction = (t: number) => Day(t);
export const TimeDayOfWeek: BuiltinFunction = (t: number) => DayOfWeek(t);
export const TimeDayOfYear: BuiltinFunction = (t: number) => DayOfYear(t);
export const TimeHour: BuiltinFunction = (t: number) => Hour(t);
export const TimeMinute: BuiltinFunction = (t: number) => Minute(t);
export const TimeMonth: BuiltinFunction = (t: number) => Month(t);
export const TimeSeconds: BuiltinFunction = (t: number) => Seconds(t);
export const TimeYear: BuiltinFunction = (t: number) => Year(t);

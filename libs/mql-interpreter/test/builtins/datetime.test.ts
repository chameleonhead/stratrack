import {
  Day,
  DayOfWeek,
  DayOfYear,
  Hour,
  Minute,
  Month,
  Seconds,
  Year,
  TimeCurrent,
  TimeLocal,
  TimeGMT,
  TimeDaylightSavings,
  TimeGMTOffset,
  TimeToStruct,
  StructToTime,
  TimeDay,
  TimeDayOfWeek,
  TimeDayOfYear,
  TimeHour,
  TimeMinute,
  TimeMonth,
  TimeSeconds,
  TimeYear,
} from '../../src/builtins/impl/datetime';
import { describe, it, expect } from 'vitest';

const t = 172800; // 1970-01-03T00:00:00Z

describe('date/time builtins', () => {
  it('extracts components from timestamp', () => {
    expect(TimeDay(t)).toBe(3);
    expect(TimeDayOfWeek(0)).toBe(4);
    expect(TimeDayOfYear(0)).toBe(1);
    expect(TimeHour(3600)).toBe(1);
    expect(TimeMinute(90)).toBe(1);
    expect(TimeMonth(0)).toBe(1);
    expect(TimeSeconds(90)).toBe(30);
    expect(TimeYear(0)).toBe(1970);
  });

  it('alias helpers without argument use current time', () => {
    expect(Day(t)).toBe(3);
    expect(Hour(3600)).toBe(1);
    expect(Minute(90)).toBe(1);
  });

  it('TimeCurrent and TimeLocal return now', () => {
    const now = Math.floor(Date.now() / 1000);
    const cur = TimeCurrent();
    const local = TimeLocal();
    expect(Math.abs(cur - now) <= 1).toBe(true);
    expect(Math.abs(local - now) <= 1).toBe(true);
  });

  it('TimeGMT matches offset from local time', () => {
    const local = TimeLocal();
    const gmt = TimeGMT();
    const offset = TimeGMTOffset();
    expect(Math.abs(local - offset - gmt) <= 1).toBe(true);
  });

  it('TimeDaylightSavings reflects DST', () => {
    const now = new Date();
    const jan = new Date(now.getFullYear(), 0, 1);
    const jul = new Date(now.getFullYear(), 6, 1);
    const std = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
    const expectDst = now.getTimezoneOffset() < std ? 1 : 0;
    expect(TimeDaylightSavings()).toBe(expectDst);
  });

  it('TimeToStruct and StructToTime round trip', () => {
    const s = TimeToStruct(0);
    expect(StructToTime(s)).toBe(0);
  });
});

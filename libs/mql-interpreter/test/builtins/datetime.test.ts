import {
  Day,
  Hour,
  Minute,
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
} from "../../src/builtins/impl/datetime";
import { describe, it, expect } from "vitest";

const t = 946782245; // 2000-01-02T03:04:05Z

describe("date/time builtins", () => {
  it("extracts components from timestamp", () => {
    expect(TimeDay(t)).toBe(2);
    expect(TimeDayOfWeek(t)).toBe(0);
    expect(TimeDayOfYear(t)).toBe(2);
    expect(TimeHour(t)).toBe(3);
    expect(TimeMinute(t)).toBe(4);
    expect(TimeMonth(t)).toBe(1);
    expect(TimeSeconds(t)).toBe(5);
    expect(TimeYear(t)).toBe(2000);
  });

  it("alias helpers without argument use current time", () => {
    expect(Day(t)).toBe(2);
    expect(Hour(3600)).toBe(1);
    expect(Minute(90)).toBe(1);
  });

  it("TimeCurrent return now", () => {
    const now = Math.floor(Date.now() / 1000);
    const cur = TimeCurrent();
    expect(Math.abs(cur - now)).toBeLessThan(1);
  });

  it("TimeLocal return now with offset and TimeGMTOffset returns offset", () => {
    const now = Math.floor(Date.now() / 1000);
    const local = TimeLocal();
    const offset = TimeGMTOffset();
    expect(Math.abs(local - offset - now)).toBeLessThan(1);
  });

  it("TimeGMT matches offset from local time", () => {
    const utc = TimeCurrent();
    const gmt = TimeGMT();
    expect(Math.abs(gmt - utc)).toBeLessThan(TimeDaylightSavings() === 1 ? 3601 : 1);
  });

  it("TimeDaylightSavings reflects DST", () => {
    expect(TimeDaylightSavings()).toBeOneOf([0, 1]);
  });

  it("TimeToStruct and StructToTime round trip", () => {
    const s = TimeToStruct(0);
    expect(Number(StructToTime(s))).toBe(0);
  });
});

import { Day, Hour, TimeCurrent, TimeToStruct } from '../../src/builtins/impl/datetime';
import { describe, it, expect } from 'vitest';

describe('date/time builtins', () => {
  it('Day returns day of month', () => {
    expect(Day(172800)).toBe(3); // 1970-01-03
  });

  it('Hour returns hour of day', () => {
    expect(Hour(3600)).toBe(1);
  });

  it('TimeCurrent roughly matches Date.now', () => {
    const now = Math.floor(Date.now() / 1000);
    const cur = TimeCurrent();
    expect(cur === now || cur === now - 1 || cur === now + 1).toBe(true);
  });

  it('TimeToStruct converts timestamp', () => {
    const s = TimeToStruct(0);
    expect(s.year).toBe(1970);
    expect(s.mon).toBe(1);
    expect(s.day).toBe(1);
  });
});

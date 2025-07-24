import { CharToString, StringToTime, NormalizeDouble } from '../../src/builtins/impl/convert';
import { describe, it, expect } from 'vitest';

describe('convert builtins', () => {
  it('CharToString converts numbers and strings', () => {
    expect(CharToString(65)).toBe('A');
    expect(CharToString('xyz')).toBe('x');
  });

  it('StringToTime parses dates', () => {
    const ts = StringToTime('1970-01-01T00:00:01Z');
    expect(ts).toBe(1);
  });

  it('NormalizeDouble rounds values', () => {
    expect(NormalizeDouble(1.23456, 2)).toBe(1.23);
  });
});

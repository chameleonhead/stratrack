import { StringLen, StringSubstr, StringTrimLeft, StringTrimRight } from '../../src/builtins/impl/strings';
import { describe, it, expect } from 'vitest';

describe('string builtins', () => {
  it('StringLen returns length', () => {
    expect(StringLen('abc')).toBe(3);
  });

  it('StringSubstr extracts substring', () => {
    expect(StringSubstr('hello', 1, 3)).toBe('ell');
  });

  it('StringTrimLeft removes leading spaces', () => {
    const obj = { value: '  test' };
    StringTrimLeft(obj);
    expect(obj.value).toBe('test');
  });

  it('StringTrimRight removes trailing spaces', () => {
    const obj = { value: 'test  ' };
    StringTrimRight(obj);
    expect(obj.value).toBe('test');
  });
});

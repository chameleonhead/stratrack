import { getBuiltin } from '../src/builtins';
import { describe, it, expect } from 'vitest';

describe('builtins', () => {
  it('provides Print function', () => {
    const fn = getBuiltin('Print');
    expect(fn).toBeTypeOf('function');
  });

  it('provides an account information function', () => {
    const fn = getBuiltin('AccountBalance');
    expect(fn).toBeTypeOf('function');
  });

  it('returns undefined for unknown', () => {
    expect(getBuiltin('Unknown')).toBeUndefined();
  });
});

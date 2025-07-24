import { MathAbs, MathPow, MathSqrt } from '../../src/builtins/impl/math';
import { describe, it, expect } from 'vitest';

describe('math builtins', () => {
  it('MathAbs returns absolute value', () => {
    expect(MathAbs(-5)).toBe(5);
  });

  it('MathPow computes exponentiation', () => {
    expect(MathPow(2, 3)).toBe(8);
  });

  it('MathSqrt computes square root', () => {
    expect(MathSqrt(9)).toBe(3);
  });
});

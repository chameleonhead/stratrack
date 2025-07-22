import { evaluateExpression } from '../src/expression';
import { describe, it, expect } from 'vitest';

describe('evaluateExpression', () => {
  it('handles prefix and postfix increment', () => {
    const env: any = { a: 1 };
    expect(evaluateExpression('++a', env)).toBe(2);
    expect(env.a).toBe(2);
    expect(evaluateExpression('a++', env)).toBe(2);
    expect(env.a).toBe(3);
  });

  it('handles compound assignment', () => {
    const env: any = { x: 1 };
    expect(evaluateExpression('x += 5', env)).toBe(6);
    expect(env.x).toBe(6);
  });

  it('evaluates ternary', () => {
    const env: any = { a: 1 };
    const result = evaluateExpression('a > 0 ? 10 : 5', env);
    expect(result).toBe(10);
  });
});

import { evaluateExpression } from '../src/expression';
import { interpret } from '../src/index';
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

  it('respects operator precedence', () => {
    const env: any = { a: 1 };
    const result = evaluateExpression('1 + 2 * 3 - a', env);
    expect(result).toBe(6); // 1 + 6 - 1
  });

  it('creates objects with new', () => {
    const runtime = interpret('class A{int x;}');
    const obj = evaluateExpression('new A', {}, runtime);
    expect(obj).toEqual({ x: undefined });
  });
});

import { compile } from '../src';
import { describe, it, expect } from 'vitest';

describe('compile errors', () => {
  it('reports unknown types', () => {
    const result = compile('Foo x;');
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('reports unknown parameter types', () => {
    const result = compile('void foo(Bogus a);');
    const found = result.errors.some(e =>
      e.message.includes('Unknown type Bogus for parameter a')
    );
    expect(found).toBe(true);
  });

  it('skips type checking when syntax errors exist', () => {
    const result = compile('void f(');
    expect(result.errors.length).toBe(1);
  });
});

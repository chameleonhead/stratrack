import { compile } from '../src';
import { describe, it, expect } from 'vitest';

describe('function call validation', () => {
  it('reports unknown function', () => {
    const result = compile('void start(){ Foo(); }');
    expect(result.errors.some(e => e.message.includes('Unknown function Foo'))).toBe(true);
  });

  it('checks argument count', () => {
    const src = 'void f(int a, int b=1); void start(){ f(); }';
    const result = compile(src);
    expect(result.errors.some(e => e.message.includes('Incorrect argument count'))).toBe(true);
  });
});

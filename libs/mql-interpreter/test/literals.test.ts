import { describe, it, expect } from 'vitest';
import { evaluateExpression } from '../src/expression';
import { compile } from '../src';

describe('literal expressions', () => {
  it('parses boolean constants', () => {
    expect(evaluateExpression('true')).toBe(1);
    expect(evaluateExpression('false')).toBe(0);
  });

  it('parses hexadecimal and scientific numbers', () => {
    expect(evaluateExpression('0x10')).toBe(16);
    expect(evaluateExpression('1e2')).toBe(100);
    expect(evaluateExpression('0.5')).toBe(0.5);
  });

  it('parses character constants', () => {
    expect(evaluateExpression("'A'")).toBe(65);
    expect(evaluateExpression("'\\n'")).toBe(10);
    expect(evaluateExpression("'\\x41'")).toBe(65);
  });

  it('parses color literals', () => {
    expect(evaluateExpression("C'255,0,0'")).toBe(0x0000ff);
    expect(evaluateExpression("C'0,0,255'")).toBe(0xff0000);
  });

  it('parses datetime literals', () => {
    expect(evaluateExpression("D'1970.01.01 00:00:01'")).toBe(1);
  });

  it('resolves enumeration constants at compile time', () => {
    const { runtime } = compile('enum E{ A=2,B }; int x=A; int f(){ return B; }');
    expect(runtime.variables.x.initialValue).toBe('2');
    expect(runtime.functions.f[0].body.trim()).toBe('return 3 ;');
  });
});

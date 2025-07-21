import { lex } from '../src/lexer';
import { parse } from '../src/parser';
import { execute, callFunction } from '../src/runtime';
import { describe, it, expect } from 'vitest';

const code = 'void myfunc(string s="hi");';
const runtime = execute(parse(lex(code)));

describe('callFunction', () => {
  it('throws when function missing', () => {
    expect(() => callFunction(runtime, 'unknown')).toThrow('Function unknown not found');
  });

  it('applies default parameter', () => {
    expect(() => callFunction(runtime, 'myfunc')).toThrow('Function myfunc has no implementation');
  });

  it('checks argument count', () => {
    expect(() => callFunction(runtime, 'myfunc', ['a', 'b'])).toThrow('Too many arguments');
  });

  it('invokes builtin without signature', () => {
    expect(callFunction(runtime, 'Print', ['test'])).toBe(0);
  });
});

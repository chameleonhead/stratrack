import { lex } from '../src/lexer';
import { parse } from '../src/parser';
import { execute, callFunction } from '../src/runtime';
import { describe, it, expect } from 'vitest';

const code = 'void myfunc(string s="hi");';
const runtime = execute(parse(lex(code).tokens));

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

  it('handles overloaded functions', () => {
    const r = execute(
      parse(
        lex('void foo(); void foo(int a, int b=1);').tokens
      )
    );
    expect(() => callFunction(r, 'foo')).toThrow('Function foo has no implementation');
    expect(() => callFunction(r, 'foo', [1])).toThrow('Function foo has no implementation');
    expect(() => callFunction(r, 'foo', [1, 2, 3])).toThrow('Too many arguments');
  });

  it('checks reference argument type', () => {
    const r = execute(parse(lex('void mod(int &v);').tokens));
    expect(() => callFunction(r, 'mod', [1])).toThrow('Argument v must be passed by reference');
  });

  it('validates primitive argument types', () => {
    const r = execute(parse(lex('void foo(int a, string b);').tokens));
    expect(() => callFunction(r, 'foo', ['x', 'y'])).toThrow('Argument a expected int');
    expect(() => callFunction(r, 'foo', [1, 2])).toThrow('Argument b expected string');
  });

  it('passes reference object to builtin', () => {
    const r = execute(parse(lex('void StringTrimLeft(string &s);').tokens));
    const ref = { value: '  hi' };
    callFunction(r, 'StringTrimLeft', [ref]);
    expect(ref.value).toBe('hi');
  });
});

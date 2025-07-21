import { lex } from '../src/lexer';
import { parse } from '../src/parser';
import { execute } from '../src/runtime';
import { describe, it, expect } from 'vitest';

describe('execute', () => {
  it('evaluates enums', () => {
    const tokens = lex('enum Color { Red=1, Green, Blue };');
    const ast = parse(tokens);
    const runtime = execute(ast);
    expect(runtime.enums.Color).toEqual({ Red: 1, Green: 2, Blue: 3 });
  });

  it('stores classes with inheritance when base exists', () => {
    const tokens = lex('class Parent {} class Child : Parent {}');
    const ast = parse(tokens);
    const runtime = execute(ast);
    expect(runtime.classes.Child).toEqual({ base: 'Parent', fields: {} });
  });

  it('stores class fields', () => {
    const tokens = lex('class A { int a; string b; }');
    const ast = parse(tokens);
    const runtime = execute(ast);
    expect(runtime.classes.A).toEqual({
      base: undefined,
      fields: {
        a: { type: 'int', dimensions: [] },
        b: { type: 'string', dimensions: [] },
      },
    });
  });

  it('stores dynamic array fields', () => {
    const tokens = lex('class A { double arr[]; }');
    const ast = parse(tokens);
    const runtime = execute(ast);
    expect(runtime.classes.A.fields.arr).toEqual({ type: 'double', dimensions: [null] });
  });

  it('throws when base class is missing', () => {
    const tokens = lex('class Child : Parent {}');
    const ast = parse(tokens);
    expect(() => execute(ast)).toThrowError('Base class Parent not found');
  });
});

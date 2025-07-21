import { lex } from '../src/lexer';
import { parse, EnumDeclaration, ClassDeclaration } from '../src/parser';
import { describe, it, expect } from 'vitest';

describe('parse', () => {
  it('parses enum declaration', () => {
    const tokens = lex('enum Color { Red = 1, Green, Blue };');
    const ast = parse(tokens);
    const enumDecl = ast[0] as EnumDeclaration;
    expect(enumDecl.type).toBe('EnumDeclaration');
    expect(enumDecl.name).toBe('Color');
    expect(enumDecl.members).toEqual([
      { name: 'Red', value: '1' },
      { name: 'Green', value: undefined },
      { name: 'Blue', value: undefined },
    ]);
  });

  it('parses class with base', () => {
    const tokens = lex('class Child : Parent { }');
    const ast = parse(tokens);
    const classDecl = ast[0] as ClassDeclaration;
    expect(classDecl.type).toBe('ClassDeclaration');
    expect(classDecl.name).toBe('Child');
    expect(classDecl.base).toBe('Parent');
  });

  it('parses multiple declarations', () => {
    const tokens = lex('enum E{A};class C{}');
    const ast = parse(tokens);
    expect(ast.length).toBe(2);
    expect((ast[1] as ClassDeclaration).name).toBe('C');
  });

  it('skips irrelevant tokens and parses class body', () => {
    const tokens = lex('int x; class D { int a; }');
    const ast = parse(tokens);
    expect((ast[0] as ClassDeclaration).name).toBe('D');
  });

  it('handles nested blocks and semicolons', () => {
    const code = 'class E { void f() { int y; } };';
    const tokens = lex(code);
    const ast = parse(tokens);
    expect((ast[0] as ClassDeclaration).name).toBe('E');
  });

  it('throws on invalid syntax', () => {
    const tokens = lex('enum X {');
    expect(() => parse(tokens)).toThrow();
  });

  it('throws on wrong token type', () => {
    const tokens = lex('enum { }');
    expect(() => parse(tokens)).toThrow();
  });

  it('throws on wrong token value', () => {
    const tokens = lex('enum X ;');
    expect(() => parse(tokens)).toThrow();
  });
});

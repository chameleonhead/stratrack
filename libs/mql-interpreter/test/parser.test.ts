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
});

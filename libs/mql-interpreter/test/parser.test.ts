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
    expect(classDecl.fields.length).toBe(0);
  });

  it('parses class fields', () => {
    const tokens = lex('class A { int a; string b; }');
    const ast = parse(tokens);
    const classDecl = ast[0] as ClassDeclaration;
    expect(classDecl.fields).toEqual([
      { name: 'a', fieldType: 'int', dimensions: [] },
      { name: 'b', fieldType: 'string', dimensions: [] },
    ]);
  });

  it('parses dynamic array fields', () => {
    const tokens = lex('class B { double arr[]; int matrix[][10]; }');
    const ast = parse(tokens);
    const classDecl = ast[0] as ClassDeclaration;
    expect(classDecl.fields).toEqual([
      { name: 'arr', fieldType: 'double', dimensions: [null] },
      { name: 'matrix', fieldType: 'int', dimensions: [null, 10] },
    ]);
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
    const decl = ast[0] as ClassDeclaration;
    expect(decl.name).toBe('D');
    expect(decl.fields).toEqual([{ name: 'a', fieldType: 'int', dimensions: [] }]);
  });

  it('handles nested blocks and semicolons', () => {
    const code = 'class E { void f() { int y; } };';
    const tokens = lex(code);
    const ast = parse(tokens);
    const decl = ast[0] as ClassDeclaration;
    expect(decl.name).toBe('E');
    expect(decl.fields.length).toBe(0);
  });

  it('skips unknown tokens and braces', () => {
    const code = 'class F { 42; { int x; } void g(); int a; }';
    const tokens = lex(code);
    const ast = parse(tokens);
    const decl = ast[0] as ClassDeclaration;
    expect(decl.fields).toEqual([{ name: 'a', fieldType: 'int', dimensions: [] }]);
  });

  it('handles nested blocks inside methods', () => {
    const code = 'class H { void h() { if(true){ int x; } } int a; }';
    const tokens = lex(code);
    const ast = parse(tokens);
    const decl = ast[0] as ClassDeclaration;
    expect(decl.fields).toEqual([{ name: 'a', fieldType: 'int', dimensions: [] }]);
  });

  it('throws when void is used as field type', () => {
    const tokens = lex('class G { void bad; }');
    expect(() => parse(tokens)).toThrow('void type cannot be used for fields');
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

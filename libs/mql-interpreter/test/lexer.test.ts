import { lex, TokenType } from '../src/lexer';
import { parse } from '../src/parser';
import { describe, it, expect } from 'vitest';

describe('lex', () => {
  it('tokenizes a simple declaration', () => {
    const tokens = lex('int a = 5;');
    expect(tokens).toEqual([
      { type: TokenType.Keyword, value: 'int' },
      { type: TokenType.Identifier, value: 'a' },
      { type: TokenType.Operator, value: '=' },
      { type: TokenType.Number, value: '5' },
      { type: TokenType.Punctuation, value: ';' },
    ]);
  });

  it('recognizes additional builtin types', () => {
    const tokens = lex('bool flag;');
    expect(tokens[0]).toEqual({ type: TokenType.Keyword, value: 'bool' });
  });

  it('recognizes control statement keywords', () => {
    const tokens = lex('for(i=0;i<10;i++){}');
    expect(tokens[0]).toEqual({ type: TokenType.Keyword, value: 'for' });
  });

  it('ignores comments and strings', () => {
    const tokens = lex('int a = 5; // comment\n/*multi*/string s="hi";');
    expect(tokens).toEqual([
      { type: TokenType.Keyword, value: 'int' },
      { type: TokenType.Identifier, value: 'a' },
      { type: TokenType.Operator, value: '=' },
      { type: TokenType.Number, value: '5' },
      { type: TokenType.Punctuation, value: ';' },
      { type: TokenType.Keyword, value: 'string' },
      { type: TokenType.Identifier, value: 's' },
      { type: TokenType.Operator, value: '=' },
      { type: TokenType.String, value: 'hi' },
      { type: TokenType.Punctuation, value: ';' },
    ]);
  });

  it('handles escape sequences and two-char operators', () => {
    const tokens = lex('"a\\"b"==');
    expect(tokens).toEqual([
      { type: TokenType.String, value: 'a\\"b' },
      { type: TokenType.Operator, value: '==' }
    ]);
  });

  it('recognizes compound and multi-character operators', () => {
    const tokens = lex('i+=2; j<<=1; k++; a?b:c;');
    expect(tokens).toEqual([
      { type: TokenType.Identifier, value: 'i' },
      { type: TokenType.Operator, value: '+=' },
      { type: TokenType.Number, value: '2' },
      { type: TokenType.Punctuation, value: ';' },
      { type: TokenType.Identifier, value: 'j' },
      { type: TokenType.Operator, value: '<<=' },
      { type: TokenType.Number, value: '1' },
      { type: TokenType.Punctuation, value: ';' },
      { type: TokenType.Identifier, value: 'k' },
      { type: TokenType.Operator, value: '++' },
      { type: TokenType.Punctuation, value: ';' },
      { type: TokenType.Identifier, value: 'a' },
      { type: TokenType.Operator, value: '?' },
      { type: TokenType.Identifier, value: 'b' },
      { type: TokenType.Punctuation, value: ':' },
      { type: TokenType.Identifier, value: 'c' },
      { type: TokenType.Punctuation, value: ';' },
    ]);
  });

  it('distinguishes prefix and postfix increment/decrement', () => {
    const pre = lex('--a');
    const post = lex('a++');
    expect(pre).toEqual([
      { type: TokenType.Operator, value: '--' },
      { type: TokenType.Identifier, value: 'a' },
    ]);
    expect(post).toEqual([
      { type: TokenType.Identifier, value: 'a' },
      { type: TokenType.Operator, value: '++' },
    ]);
  });

  it('throws on unknown characters', () => {
    expect(() => lex('#')).toThrow();
  });

  it('enforces identifier length limit', () => {
    const longName = 'a'.repeat(64);
    expect(() => lex(`${longName} = 1;`)).toThrow('Identifier too long');
  });

  it('treats reserved words as keywords', () => {
    const tokens = lex('template<typename T> struct S {};');
    expect(tokens[0]).toEqual({ type: TokenType.Keyword, value: 'template' });
    expect(tokens[2]).toEqual({ type: TokenType.Keyword, value: 'typename' });
  });

  it('fails when reserved word used as identifier', () => {
    const tokens = lex('int for = 1;');
    expect(tokens[1]).toEqual({ type: TokenType.Keyword, value: 'for' });
  });
});

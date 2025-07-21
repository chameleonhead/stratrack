import { lex, TokenType } from '../src/lexer';
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

  it('throws on unknown characters', () => {
    expect(() => lex('#')).toThrow();
  });
});

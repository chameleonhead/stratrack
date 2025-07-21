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
});

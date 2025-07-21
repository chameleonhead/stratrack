import { lex, Token, TokenType } from './lexer';
export { lex, Token, TokenType };

export function interpret(source: string): void {
  console.log('Interpreting source...');
  const tokens = lex(source);
  console.log(tokens);
}

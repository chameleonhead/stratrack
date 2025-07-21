import { lex, Token, TokenType } from './lexer';
import { parse, Declaration } from './parser';
export { lex, Token, TokenType, parse, Declaration };

export function interpret(source: string): void {
  console.log('Interpreting source...');
  const tokens = lex(source);
  console.log(tokens);
  const ast = parse(tokens);
  console.log(ast);
}

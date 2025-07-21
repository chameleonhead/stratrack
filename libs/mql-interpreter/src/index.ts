import { lex, Token, TokenType } from './lexer';
import { parse, Declaration } from './parser';
import { execute, Runtime } from './runtime';

export { lex, Token, TokenType, parse, Declaration, execute, Runtime };

export function interpret(source: string): Runtime {
  const tokens = lex(source);
  const ast = parse(tokens);
  return execute(ast);
}

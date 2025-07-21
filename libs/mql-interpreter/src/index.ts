import { lex, Token, TokenType } from './lexer';
import { parse, Declaration } from './parser';
import { execute, Runtime } from './runtime';
import { cast, PrimitiveType } from './casting';

export {
  lex,
  Token,
  TokenType,
  parse,
  Declaration,
  execute,
  Runtime,
  cast,
  PrimitiveType,
};

export function interpret(source: string): Runtime {
  const tokens = lex(source);
  const ast = parse(tokens);
  return execute(ast);
}

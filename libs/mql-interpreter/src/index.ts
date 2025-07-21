import { lex, Token, TokenType } from './lexer';
import { parse, Declaration, ClassDeclaration, ClassField } from './parser';
import { execute, Runtime, ExecutionContext } from './runtime';
import { cast, PrimitiveType } from './casting';

export {
  lex,
  Token,
  TokenType,
  parse,
  Declaration,
  ClassDeclaration,
  ClassField,
  execute,
  Runtime,
  ExecutionContext,
  cast,
  PrimitiveType,
};

export function interpret(
  source: string,
  entryPointOrContext?: string | ExecutionContext
): Runtime {
  const tokens = lex(source);
  const ast = parse(tokens);
  return execute(ast, entryPointOrContext);
}

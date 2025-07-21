import { lex, Token, TokenType } from './lexer';
import { parse, Declaration, ClassDeclaration, ClassField } from './parser';
import { execute, Runtime, ExecutionContext } from './runtime';
import { cast, PrimitiveType } from './casting';
import { ArrayResize } from './arrayResize';
import { getBuiltin, BuiltinFunction } from './builtins';
import { preprocess, MacroMap } from './preprocess';

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
  ArrayResize,
  preprocess,
  MacroMap,
  getBuiltin,
  BuiltinFunction,
};

export function interpret(
  source: string,
  entryPointOrContext?: string | ExecutionContext
): Runtime {
  const tokens = preprocess(source);
  const ast = parse(tokens);
  return execute(ast, entryPointOrContext);
}

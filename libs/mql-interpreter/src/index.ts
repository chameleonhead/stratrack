import { lex, Token, TokenType } from './lexer';
import { parse, Declaration, ClassDeclaration, ClassField } from './parser';
import { execute, Runtime, ExecutionContext } from './runtime';
import { cast, PrimitiveType } from './casting';
import { ArrayResize } from './arrayResize';
import { getBuiltin, BuiltinFunction } from './builtins';
import {
  preprocess,
  preprocessWithProperties,
  MacroMap,
  PreprocessResult,
  PropertyMap,
  PreprocessOptions,
} from './preprocess';

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
  preprocessWithProperties,
  MacroMap,
  PreprocessResult,
  PropertyMap,
  PreprocessOptions,
  getBuiltin,
  BuiltinFunction,
};

export function interpret(
  source: string,
  entryPointOrContext?: string | ExecutionContext,
  options: PreprocessOptions = {}
): Runtime {
  const { tokens, properties } = preprocessWithProperties(source, options);
  const ast = parse(tokens);
  const runtime = execute(ast, entryPointOrContext);
  runtime.properties = properties;
  return runtime;
}

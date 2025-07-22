import { lex, Token, TokenType } from './lexer';
import {
  parse,
  Declaration,
  ClassDeclaration,
  ClassField,
  ClassMethod,
  FunctionDeclaration,
  ControlStatement,
  VariableDeclaration,
  FunctionParameter,
} from './parser';
import {
  execute,
  Runtime,
  ExecutionContext,
  RuntimeFunctionParameter,
  callFunction,
} from './runtime';
import { cast, PrimitiveType } from './casting';
import { ArrayResize } from './arrayResize';
import { getBuiltin, BuiltinFunction, registerEnvBuiltins } from './builtins';
import { evaluateExpression } from './expression';
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
  ClassMethod,
  FunctionDeclaration,
  FunctionParameter,
  ControlStatement,
  VariableDeclaration,
  execute,
  Runtime,
  RuntimeFunctionParameter,
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
  registerEnvBuiltins,
  callFunction,
  evaluateExpression,
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

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
  instantiate,
  callMethod,
} from './runtime';
import { cast, PrimitiveType } from './casting';
import { ArrayResize } from './arrayResize';
import { getBuiltin, BuiltinFunction, registerEnvBuiltins } from './builtins';
import { evaluateExpression } from './expression';
import { executeStatements } from './statements';
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
  instantiate,
  callMethod,
  evaluateExpression,
  executeStatements,
};

export interface Compilation {
  ast: Declaration[];
  runtime: Runtime;
  properties: PropertyMap;
}

export function compile(
  source: string,
  options: PreprocessOptions = {}
): Compilation {
  const { tokens, properties } = preprocessWithProperties(source, options);
  const ast = parse(tokens);
  const runtime = execute(ast);
  runtime.properties = properties;
  return { ast, runtime, properties };
}

export function interpret(
  source: string,
  context?: ExecutionContext,
  options: PreprocessOptions = {}
): Runtime {
  const { ast, runtime, properties } = compile(source, options);
  runtime.properties = properties;
  if (context) {
    for (const name in runtime.variables) {
      const info = runtime.variables[name];
      if (info.storage === 'input' && context.inputValues?.[name] !== undefined) {
        runtime.globalValues[name] = context.inputValues[name];
      }
      if (info.storage === 'extern' && context.externValues?.[name] !== undefined) {
        runtime.globalValues[name] = context.externValues[name];
      }
    }
    if (context.entryPoint) {
      callFunction(runtime, context.entryPoint, context.args);
    }
  }
  return runtime;
}

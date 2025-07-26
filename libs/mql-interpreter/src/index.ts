import { lex, Token, TokenType, LexError, LexResult } from './lexer';
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
  ParseError,
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
import {
  ArrayResize,
  ArrayCopy,
  ArraySetAsSeries,
  ArrayGetAsSeries,
  ArrayIsSeries,
  ArrayIsDynamic,
  ArraySize,
  ArrayRange,
  ArrayDimension,
  ArrayFree,
  ArrayInitialize,
  ArrayFill,
  ArraySort,
  ArrayMaximum,
  ArrayMinimum,
  ArrayBsearch,
  ArrayCompare,
} from './builtins/impl/array';
import {
  StringTrimLeft,
  StringTrimRight,
  StringLen,
  StringSubstr,
  StringAdd,
  StringBufferLen,
  StringCompare,
  StringConcatenate,
  StringFill,
  StringFind,
  StringGetChar,
  StringSetChar,
  StringInit,
  StringReplace,
  StringSplit,
  StringToLower,
  StringToUpper,
  StringGetCharacter,
  StringSetCharacter,
} from './builtins/impl/strings';
import { getBuiltin, BuiltinFunction, registerEnvBuiltins } from './builtins';
import { evaluateExpression } from './expression';
import { executeStatements } from './statements';
import {
  MathAbs,
  MathArccos,
  MathArcsin,
  MathArctan,
  MathCeil,
  MathCos,
  MathExp,
  MathFloor,
  MathLog,
  MathLog10,
  MathMax,
  MathMin,
  MathMod,
  MathPow,
  MathRand,
  MathRound,
  MathSin,
  MathSqrt,
  MathSrand,
  MathTan,
  MathIsValidNumber,
} from './builtins/impl/math';
import {
  Day,
  DayOfWeek,
  DayOfYear,
  Hour,
  Minute,
  Month,
  Seconds,
  Year,
  TimeCurrent,
  TimeLocal,
  TimeGMT,
  TimeDaylightSavings,
  TimeGMTOffset,
  TimeToStruct,
  StructToTime,
  TimeDay,
  TimeDayOfWeek,
  TimeDayOfYear,
  TimeHour,
  TimeMinute,
  TimeMonth,
  TimeSeconds,
  TimeYear,
} from './builtins/impl/datetime';
import {
  preprocess,
  preprocessWithProperties,
  MacroMap,
  PreprocessResult,
  PropertyMap,
  PreprocessOptions,
} from './preprocess';
import { BacktestRunner, parseCsv, Candle, ticksToCandles } from './backtest';
import { MarketData, Tick } from './market';
import { Broker, OrderState } from './broker';
import { Account } from './account';
import { VirtualTerminal } from './terminal';
import { setTerminal } from './builtins/impl/common';

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
  ArrayCopy,
  ArraySetAsSeries,
  ArrayGetAsSeries,
  ArrayIsSeries,
  ArrayIsDynamic,
  ArraySize,
  ArrayRange,
  ArrayDimension,
  ArrayFree,
  ArrayInitialize,
  ArrayFill,
  ArraySort,
  ArrayMaximum,
  ArrayMinimum,
  ArrayBsearch,
  ArrayCompare,
  StringTrimLeft,
  StringTrimRight,
  StringLen,
  StringSubstr,
  StringAdd,
  StringBufferLen,
  StringCompare,
  StringConcatenate,
  StringFill,
  StringFind,
  StringGetChar,
  StringSetChar,
  StringInit,
  StringReplace,
  StringSplit,
  StringToLower,
  StringToUpper,
  StringGetCharacter,
  StringSetCharacter,
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
  LexError,
  LexResult,
  Candle,
  BacktestRunner,
  Broker,
  Account,
  MarketData,
  OrderState,
  parseCsv,
  Tick,
  ticksToCandles,
  MathAbs,
  MathArccos,
  MathArcsin,
  MathArctan,
  MathCeil,
  MathCos,
  MathExp,
  MathFloor,
  MathLog,
  MathLog10,
  MathMax,
  MathMin,
  MathMod,
  MathPow,
  MathRand,
  MathRound,
  MathSin,
  MathSqrt,
  MathSrand,
  MathTan,
  MathIsValidNumber,
  Day,
  DayOfWeek,
  DayOfYear,
  Hour,
  Minute,
  Month,
  Seconds,
  Year,
  TimeCurrent,
  TimeLocal,
  TimeGMT,
  TimeDaylightSavings,
  TimeGMTOffset,
  TimeToStruct,
  StructToTime,
  TimeDay,
  TimeDayOfWeek,
  TimeDayOfYear,
  TimeHour,
  TimeMinute,
  TimeMonth,
  TimeSeconds,
  TimeYear,
  VirtualTerminal,
  setTerminal,
};

export interface Compilation {
  ast: Declaration[];
  runtime: Runtime;
  properties: PropertyMap;
  errors: CompilationError[];
}

export interface CompilationError {
  message: string;
  line: number;
  column: number;
}

function checkTypes(ast: Declaration[]): CompilationError[] {
  const primitive = new Set([
    'void','bool','char','uchar','short','ushort','int','uint','long','ulong',
    'float','double','color','datetime','string'
  ]);
  const classes = new Set<string>();
  const enums = new Set<string>();
  for (const decl of ast) {
    if (decl.type === 'ClassDeclaration') classes.add(decl.name);
    if (decl.type === 'EnumDeclaration') enums.add(decl.name);
  }
  const errors: CompilationError[] = [];
  const isKnown = (t: string) => primitive.has(t) || classes.has(t) || enums.has(t);
  for (const decl of ast) {
    if (decl.type === 'VariableDeclaration') {
      if (!isKnown(decl.varType)) {
        errors.push({ message: `Unknown type ${decl.varType}`, line: decl.loc?.line ?? 0, column: decl.loc?.column ?? 0 });
      }
    } else if (decl.type === 'FunctionDeclaration') {
      if (!isKnown(decl.returnType) && decl.returnType !== 'void') {
        errors.push({ message: `Unknown return type ${decl.returnType}`, line: decl.loc?.line ?? 0, column: decl.loc?.column ?? 0 });
      }
      for (const p of decl.parameters) {
        if (!isKnown(p.paramType)) {
          errors.push({ message: `Unknown type ${p.paramType} for parameter ${p.name}`, line: decl.loc?.line ?? 0, column: decl.loc?.column ?? 0 });
        }
      }
    } else if (decl.type === 'ClassDeclaration') {
      if (decl.base && !classes.has(decl.base)) {
        errors.push({ message: `Unknown base class ${decl.base}`, line: decl.loc?.line ?? 0, column: decl.loc?.column ?? 0 });
      }
      for (const f of decl.fields) {
        if (!isKnown(f.fieldType)) {
          errors.push({ message: `Unknown type ${f.fieldType} for field ${f.name}`, line: f.loc?.line ?? 0, column: f.loc?.column ?? 0 });
        }
      }
    }
  }
  return errors;
}

export function compile(
  source: string,
  options: PreprocessOptions = {}
): Compilation {
  const { tokens, properties, errors: lexErrors } = preprocessWithProperties(source, options);
  let ast: Declaration[] = [];
  let parseError: CompilationError | null = null;
  if (lexErrors.length === 0) {
    try {
      ast = parse(tokens);
    } catch (err: any) {
      if (err instanceof ParseError) {
        parseError = { message: err.message, line: err.line, column: err.column };
      } else {
        parseError = { message: err.message ?? String(err), line: 0, column: 0 };
      }
    }
  }
  const runtime = execute(ast);
  runtime.properties = properties;
  const errors = [...lexErrors];
  if (parseError) {
    errors.push(parseError);
  } else {
    errors.push(...checkTypes(ast));
  }
  return { ast, runtime, properties, errors };
}

export function interpret(
  source: string,
  context?: ExecutionContext,
  options: PreprocessOptions = {}
): Runtime {
  const { ast, runtime, properties, errors } = compile(source, options);
  if (errors.length) {
    const msg = errors.map(e => `${e.line}:${e.column} ${e.message}`).join('\n');
    throw new Error(`Compilation failed:\n${msg}`);
  }
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

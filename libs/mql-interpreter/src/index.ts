import { lex, Token, TokenType, LexError, LexResult } from "./parser/lexer";
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
} from "./parser/parser";
import { execute, callFunction, instantiate, callMethod, Runtime } from "./runtime/runtime";
import type {
  RuntimeState,
  ExecutionContext,
  RuntimeFunctionParameter,
  ProgramType,
} from "./runtime/types";
import { cast, PrimitiveType } from "./runtime/casting";
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
} from "./libs/builtins/array";
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
} from "./libs/builtins/strings";
import { getBuiltin, BuiltinFunction, registerEnvBuiltins } from "./libs/builtins";
import { evaluateExpression } from "./runtime/expression";
import { executeStatements } from "./runtime/statements";
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
} from "./libs/builtins/math";
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
} from "./libs/builtins/datetime";
import {
  preprocess,
  preprocessWithProperties,
  MacroMap,
  PreprocessResult,
  PropertyMap,
  PreprocessOptions,
} from "./parser/preprocess";
import {
  BacktestRunner,
  parseCsv,
  BacktestReport,
  BacktestOptions,
  Broker,
  Account,
  MarketData,
  ticksToCandles,
  VirtualTerminal,
} from "./libs";
import type { OrderState, Tick, Candle, TerminalStorage } from "./libs";
import { setTerminal } from "./libs/builtins/common";
import { builtinSignatures } from "./libs/signatures";
import type { BuiltinSignaturesMap } from "./libs/signatures";
import { checkTypes, validateFunctionCalls, validateOverrides } from "./semantic/checker";
export type { BuiltinParam, BuiltinSignature, BuiltinSignaturesMap } from "./libs/signatures";
import {
  warnings as warningDefinitions,
  WarningCode,
  getWarningCodes,
  getWarnings,
} from "./parser/warnings";

export function getBuiltinSignatures(): BuiltinSignaturesMap {
  return builtinSignatures;
}

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
  RuntimeState,
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
  BacktestRunner,
  BacktestReport,
  BacktestOptions,
  Broker,
  Account,
  MarketData,
  parseCsv,
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
  warningDefinitions as warnings,
  getWarningCodes,
  getWarnings,
};

export type { TerminalStorage, Candle, Tick, OrderState };

export type { WarningCode, ProgramType };

export interface Compilation {
  ast: Declaration[];
  runtime: RuntimeState;
  properties: PropertyMap;
  errors: CompilationError[];
  warnings: CompilationError[];
  programType: ProgramType;
}

export interface CompilationError {
  message: string;
  line: number;
  column: number;
  code?: string;
}

export interface CompileOptions extends PreprocessOptions {
  warningsAsErrors?: boolean;
  suppressWarnings?: string[];
}

export function compile(source: string, options: CompileOptions = {}): Compilation {
  const {
    tokens,
    properties,
    errors: lexErrors,
    pragmas,
  } = preprocessWithProperties(source, options);
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
  let programType: ProgramType = "script";
  if (runtime.functions["OnCalculate"]) programType = "indicator";
  else if (runtime.functions["OnTick"]) programType = "expert";
  else if (runtime.functions["OnStart"]) programType = "script";
  runtime.programType = programType;
  const errors = [...lexErrors];
  let warnings: CompilationError[] = [];
  if (parseError) {
    errors.push(parseError);
  } else {
    errors.push(...checkTypes(ast));
    errors.push(...validateFunctionCalls(ast, builtinSignatures));
    warnings.push(...validateOverrides(ast));
  }
  const suppressedGlobal = new Set(options.suppressWarnings ?? []);
  const sortedPragmas = [...pragmas].sort((a, b) => a.line - b.line);
  const isSuppressed = (w: CompilationError) => {
    if (!w.code) return false;
    const active = new Set(suppressedGlobal);
    for (const p of sortedPragmas) {
      if (p.line > w.line) break;
      if (p.action === "disable") p.codes.forEach((c) => active.add(c));
      else p.codes.forEach((c) => active.delete(c));
    }
    return active.has(w.code);
  };
  warnings = warnings.filter((w) => !isSuppressed(w));
  if (options.warningsAsErrors) {
    errors.push(...warnings);
  }
  return { ast, runtime, properties, errors, warnings, programType };
}

export function interpret(
  source: string,
  context?: ExecutionContext,
  options: CompileOptions = {}
): RuntimeState {
  const { runtime, properties, errors } = compile(source, options);
  if (errors.length) {
    const msg = errors.map((e) => `${e.line}:${e.column} ${e.message}`).join("\n");
    throw new Error(`Compilation failed:\n${msg}`);
  }
  runtime.properties = properties;
  if (context) {
    for (const name in runtime.variables) {
      const info = runtime.variables[name];
      if (info.storage === "input" && context.inputValues?.[name] !== undefined) {
        runtime.globalValues[name] = context.inputValues[name];
      }
      if (info.storage === "extern" && context.externValues?.[name] !== undefined) {
        runtime.globalValues[name] = context.externValues[name];
      }
    }
    runtime.context = context;
    if (context.entryPoint) {
      callFunction(runtime, context.entryPoint, context.args);
    }
  }
  return runtime;
}

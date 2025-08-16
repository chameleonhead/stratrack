import { lex, Token, TokenType, LexError, LexResult } from "./compiler/lexer.js";
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
} from "./compiler/parser.js";
import { execute, callFunction, instantiate, callMethod } from "./runtime/runtime.js";
import type {
  Runtime,
  ExecutionContext,
  RuntimeFunctionParameter,
  ProgramType,
} from "./runtime/types.js";
import { cast, PrimitiveType } from "./runtime/casting.js";
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
} from "./runtime/builtins/impl/array.js";
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
} from "./runtime/builtins/impl/strings.js";
import { getBuiltin, BuiltinFunction, registerEnvBuiltins } from "./runtime/builtins/index.js";
import { evaluateExpression } from "./runtime/expression.js";
import { executeStatements } from "./runtime/statements.js";
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
} from "./runtime/builtins/impl/math.js";
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
} from "./runtime/builtins/impl/datetime.js";
import {
  preprocess,
  preprocessWithProperties,
  MacroMap,
  PreprocessResult,
  PropertyMap,
  PreprocessOptions,
} from "./compiler/preprocess.js";
import { BacktestRunner, parseCsv, BacktestReport, BacktestOptions } from "./runtime/backtest.js";
import { MarketData, Tick, Candle, ticksToCandles } from "./runtime/market.js";
import { Broker, OrderState } from "./runtime/broker.js";
import { Account } from "./runtime/account.js";
import { VirtualTerminal } from "./runtime/terminal.js";
import { setTerminal } from "./runtime/builtins/impl/common.js";
import { builtinNames } from "./runtime/builtins/stubNames.js";
import { builtinSignatures } from "./compiler/builtins/signatures.js";
import type { BuiltinSignaturesMap } from "./compiler/builtins/signatures.js";
export type {
  BuiltinParam,
  BuiltinSignature,
  BuiltinSignaturesMap,
} from "./compiler/builtins/signatures.js";
import {
  warnings as warningDefinitions,
  WarningCode,
  getWarningCodes,
  getWarnings,
} from "./compiler/warnings.js";

export function getBuiltinSignatures(): BuiltinSignaturesMap {
  return builtinSignatures;
}

export {
  lex,
  TokenType,
  parse,
  execute,
  cast,
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
  getBuiltin,
  registerEnvBuiltins,
  callFunction,
  instantiate,
  callMethod,
  evaluateExpression,
  executeStatements,
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
  BacktestRunner,
  Broker,
  Account,
  MarketData,
  VirtualTerminal,
  setTerminal,
  warningDefinitions as warnings,
  getWarningCodes,
  getWarnings,
};

export type {
  Token,
  Declaration,
  ClassDeclaration,
  ClassField,
  ClassMethod,
  FunctionDeclaration,
  FunctionParameter,
  ControlStatement,
  VariableDeclaration,
  Runtime,
  RuntimeFunctionParameter,
  ExecutionContext,
  PrimitiveType,
  MacroMap,
  PreprocessResult,
  PropertyMap,
  PreprocessOptions,
  BuiltinFunction,
  LexError,
  LexResult,
  Candle,
  BacktestReport,
  BacktestOptions,
  OrderState,
  Tick,
  WarningCode,
  ProgramType,
};

export interface Compilation {
  ast: Declaration[];
  runtime: Runtime;
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

function checkTypes(ast: Declaration[]): CompilationError[] {
  const primitive = new Set([
    "void",
    "bool",
    "char",
    "uchar",
    "short",
    "ushort",
    "int",
    "uint",
    "long",
    "ulong",
    "float",
    "double",
    "color",
    "datetime",
    "string",
  ]);
  const classes = new Set<string>();
  const enums = new Set<string>();
  for (const decl of ast) {
    if (decl.type === "ClassDeclaration") classes.add(decl.name);
    if (decl.type === "EnumDeclaration") enums.add(decl.name);
  }
  const errors: CompilationError[] = [];
  const isKnown = (t: string) => primitive.has(t) || classes.has(t) || enums.has(t);
  for (const decl of ast) {
    if (decl.type === "VariableDeclaration") {
      if (!isKnown(decl.varType)) {
        errors.push({
          message: `Unknown type ${decl.varType}`,
          line: decl.loc?.line ?? 0,
          column: decl.loc?.column ?? 0,
        });
      }
    } else if (decl.type === "FunctionDeclaration") {
      if (!isKnown(decl.returnType) && decl.returnType !== "void") {
        errors.push({
          message: `Unknown return type ${decl.returnType}`,
          line: decl.loc?.line ?? 0,
          column: decl.loc?.column ?? 0,
        });
      }
      for (const p of decl.parameters) {
        if (!isKnown(p.paramType)) {
          errors.push({
            message: `Unknown type ${p.paramType} for parameter ${p.name}`,
            line: decl.loc?.line ?? 0,
            column: decl.loc?.column ?? 0,
          });
        }
      }
    } else if (decl.type === "ClassDeclaration") {
      if (decl.base && !classes.has(decl.base)) {
        errors.push({
          message: `Unknown base class ${decl.base}`,
          line: decl.loc?.line ?? 0,
          column: decl.loc?.column ?? 0,
        });
      }
      for (const f of decl.fields) {
        if (!isKnown(f.fieldType)) {
          errors.push({
            message: `Unknown type ${f.fieldType} for field ${f.name}`,
            line: f.loc?.line ?? 0,
            column: f.loc?.column ?? 0,
          });
        }
      }
    }
  }
  return errors;
}

function validateFunctionCalls(ast: Declaration[], runtime: Runtime): CompilationError[] {
  const errors: CompilationError[] = [];
  const builtinSet = new Set(builtinNames);

  const scanBody = (body: string | undefined, loc?: { line: number; column: number }) => {
    if (!body) return;
    const { tokens } = lex(body);
    for (let i = 0; i < tokens.length - 1; i++) {
      const t = tokens[i];
      if (t.type === TokenType.Identifier && tokens[i + 1].value === "(") {
        const name = t.value;
        let j = i + 2;
        let depth = 1;
        let args = 0;
        let expecting = true;
        while (j < tokens.length && depth > 0) {
          const tok = tokens[j];
          if (tok.value === "(") {
            depth++;
            if (depth === 1) expecting = true;
          } else if (tok.value === ")") {
            depth--;
            if (depth === 0) {
              if (!expecting) args++;
              break;
            }
          } else if (tok.value === "," && depth === 1) {
            args++;
            expecting = true;
          } else if (depth === 1) {
            expecting = false;
          }
          j++;
        }
        const overloads = runtime.functions[name];
        const sig = builtinSignatures[name];
        const isBuiltin = builtinSet.has(name) || !!sig;
        if (!overloads && !isBuiltin) {
          errors.push({
            message: `Unknown function ${name}`,
            line: loc?.line ?? 0,
            column: loc?.column ?? 0,
          });
        } else if (overloads) {
          const required = Math.min(
            ...overloads.map((o) => o.parameters.filter((p) => p.defaultValue === undefined).length)
          );
          const max = Math.max(...overloads.map((o) => o.parameters.length));
          if (args < required || args > max) {
            errors.push({
              message: `Incorrect argument count for ${name}`,
              line: loc?.line ?? 0,
              column: loc?.column ?? 0,
            });
          }
        } else if (sig) {
          const sigs = Array.isArray(sig) ? sig : [sig];
          let match = false;
          for (const s of sigs) {
            const required = s.parameters.filter((p) => !p.optional).length;
            const max = s.variadic ? Infinity : s.parameters.length;
            if (args >= required && args <= max) {
              match = true;
              break;
            }
          }
          if (!match) {
            errors.push({
              message: `Incorrect argument count for ${name}`,
              line: loc?.line ?? 0,
              column: loc?.column ?? 0,
            });
          }
        }
      }
    }
  };

  for (const decl of ast) {
    if (decl.type === "FunctionDeclaration") {
      scanBody(decl.body, decl.loc);
    } else if (decl.type === "ClassDeclaration") {
      for (const m of decl.methods) {
        scanBody(m.body, m.loc);
      }
    }
  }

  return errors;
}

function validateOverrides(ast: Declaration[]): CompilationError[] {
  const diagnostics: CompilationError[] = [];
  const classes = new Map<string, ClassDeclaration>();
  for (const decl of ast) {
    if (decl.type === "ClassDeclaration") {
      classes.set(decl.name, decl);
    }
  }
  const findBaseMethod = (
    baseName: string | undefined,
    methodName: string
  ): { method: ClassMethod; className: string } | undefined => {
    let current = baseName;
    while (current) {
      const base = classes.get(current);
      if (!base) break;
      const m = base.methods.find((mm) => mm.name === methodName);
      if (m) return { method: m, className: current };
      current = base.base;
    }
    return undefined;
  };

  for (const cls of classes.values()) {
    for (const m of cls.methods) {
      const baseInfo = findBaseMethod(cls.base, m.name);
      if (baseInfo) {
        const { method: baseMethod, className } = baseInfo;
        if (!baseMethod.virtual) {
          diagnostics.push({
            message: `Method ${m.name} overrides non-virtual method in ${className}`,
            line: m.loc?.line ?? 0,
            column: m.loc?.column ?? 0,
            code: warningDefinitions.overrideNonVirtual.code,
          });
        }
      } else if (m.override) {
        diagnostics.push({
          message: `Method ${m.name} marked override but no base method found`,
          line: m.loc?.line ?? 0,
          column: m.loc?.column ?? 0,
          code: warningDefinitions.overrideMissing.code,
        });
      }
    }
  }
  return diagnostics;
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
    errors.push(...validateFunctionCalls(ast, runtime));
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
): Runtime {
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

import { parse, ParseError } from "./parser/parser";
import { preprocessWithProperties, PropertyMap, PreprocessOptions } from "./parser/preprocess";
import type { Declaration } from "./parser/ast";
import { execute, callFunction } from "./runtime/runtime";
import type { RuntimeState, ExecutionContext, ProgramType } from "./runtime/types";
import { checkTypes, validateFunctionCalls, validateOverrides } from "./semantic/checker";
import { builtinSignatures } from "./libs/signatures";

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

import { preprocessWithProperties, PreprocessOptions, PropertyMap } from "../src/parser/preprocess";
import { parse, ParseError } from "../src/parser/parser";
import type { Declaration } from "../src/parser/ast";
import { execute, callFunction } from "../src/runtime/runtime";
import type { RuntimeState, ExecutionContext, ProgramType } from "../src/runtime/types";
import { semanticCheck, validateOverrides, SemanticError } from "../src/semantic/checker";
import { builtinSignatures } from "../src/libs/signatures";

export interface BuildOptions extends PreprocessOptions {
  warningsAsErrors?: boolean;
  suppressWarnings?: string[];
}

export interface BuildResult {
  ast: Declaration[];
  runtime: RuntimeState;
  properties: PropertyMap;
  errors: SemanticError[];
  warnings: SemanticError[];
  programType: ProgramType;
}

export function buildProgram(source: string, options: BuildOptions = {}): BuildResult {
  const {
    tokens,
    properties,
    errors: lexErrors,
    pragmas,
  } = preprocessWithProperties(source, options);
  let ast: Declaration[] = [];
  let parseErr: SemanticError | null = null;
  if (lexErrors.length === 0) {
    try {
      ast = parse(tokens);
    } catch (err: any) {
      if (err instanceof ParseError) {
        parseErr = { message: err.message, line: err.line, column: err.column };
      } else {
        parseErr = { message: String(err), line: 0, column: 0 };
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
  const errors: SemanticError[] = [...lexErrors];
  let warnings: SemanticError[] = [];
  if (parseErr) {
    errors.push(parseErr);
  } else {
    errors.push(...semanticCheck(ast, builtinSignatures));
    warnings = validateOverrides(ast);
  }
  const suppressedGlobal = new Set(options.suppressWarnings ?? []);
  const sortedPragmas = [...pragmas].sort((a, b) => a.line - b.line);
  const isSuppressed = (w: SemanticError) => {
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

export function runProgram(
  source: string,
  context?: ExecutionContext,
  options: BuildOptions = {}
): RuntimeState {
  const { runtime, properties, errors } = buildProgram(source, options);
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

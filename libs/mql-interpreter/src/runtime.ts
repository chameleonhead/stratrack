export interface RuntimeClassField {
  type: string;
  dimensions: Array<number | null>;
}

export interface RuntimeFunctionParameter {
  type: string;
  byRef: boolean;
  name: string;
  dimensions: Array<number | null>;
  defaultValue?: string;
}

export interface Runtime {
  enums: Record<string, Record<string, number>>;
  classes: Record<string, { base?: string; fields: Record<string, RuntimeClassField> }>;
  functions: Record<string, { returnType: string; parameters: RuntimeFunctionParameter[] }>;
  properties: Record<string, string[]>;
}

import { Declaration, ClassDeclaration, FunctionDeclaration } from './parser';
import { getBuiltin } from './builtins';
import { cast, PrimitiveType } from './casting';

/** Options for executing code. */
export interface ExecutionContext {
  /** Entry point function name. */
  entryPoint?: string;
}

export function execute(
  declarations: Declaration[],
  entryPointOrContext?: string | ExecutionContext
): Runtime {
  const runtime: Runtime = { enums: {}, classes: {}, functions: {}, properties: {} };

  // Extract entry point for future use. Execution of functions is not yet
  // implemented, so this is currently ignored.
  const entryPoint =
    typeof entryPointOrContext === 'string'
      ? entryPointOrContext
      : entryPointOrContext?.entryPoint;
  // TODO: implement function invocation using `entryPoint` and an execution
  // context when method parsing is available.

  for (const decl of declarations) {
    if (decl.type === 'EnumDeclaration') {
      const members: Record<string, number> = {};
      let current = 0;
      for (const member of decl.members) {
        if (member.value !== undefined) {
          current = parseInt(member.value, 10);
        }
        members[member.name] = current;
        current++;
      }
      runtime.enums[decl.name] = members;
    } else if (decl.type === 'ClassDeclaration') {
      const classDecl = decl as ClassDeclaration;
      const fields: Record<string, RuntimeClassField> = {};
      for (const f of classDecl.fields) {
        fields[f.name] = { type: f.fieldType, dimensions: f.dimensions };
      }
      runtime.classes[decl.name] = { base: classDecl.base, fields };
    } else if (decl.type === 'FunctionDeclaration') {
      const fn = decl as FunctionDeclaration;
      const params = fn.parameters.map((p) => ({
        type: p.paramType,
        byRef: p.byRef,
        name: p.name,
        dimensions: p.dimensions,
        defaultValue: p.defaultValue,
      }));
      runtime.functions[fn.name] = { returnType: fn.returnType, parameters: params };
    }
  }

  for (const name in runtime.classes) {
    const cls = runtime.classes[name];
    if (cls.base && !runtime.classes[cls.base]) {
      throw new Error(`Base class ${cls.base} not found for ${name}`);
    }
  }

  return runtime;
}

export function callFunction(runtime: Runtime, name: string, args: any[] = []): any {
  const decl = runtime.functions[name];
  const builtin = getBuiltin(name);

  if (!decl && !builtin) {
    throw new Error(`Function ${name} not found`);
  }

  if (decl) {
    if (args.length > decl.parameters.length) {
      throw new Error('Too many arguments');
    }
    const finalArgs: any[] = [];
    for (let i = 0; i < decl.parameters.length; i++) {
      const p = decl.parameters[i];
      if (i < args.length) {
        finalArgs.push(args[i]);
      } else if (p.defaultValue !== undefined) {
        finalArgs.push(cast(p.defaultValue, p.type as PrimitiveType));
      } else {
        throw new Error(`Missing argument ${p.name}`);
      }
    }
    args = finalArgs;
  }

  if (!builtin) {
    // TODO: interpret user-defined function bodies
    throw new Error(`Function ${name} has no implementation`);
  }

  return builtin(...args);
}

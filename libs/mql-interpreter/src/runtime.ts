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

export interface RuntimeClassMethod {
  name: string;
  returnType?: string;
  parameters: RuntimeFunctionParameter[];
  visibility: 'public' | 'private' | 'protected';
}

export interface Runtime {
  enums: Record<string, Record<string, number>>;
  classes: Record<string, { base?: string; fields: Record<string, RuntimeClassField>; methods: RuntimeClassMethod[] }>;
  functions: Record<string, { returnType: string; parameters: RuntimeFunctionParameter[] }[]>;
  variables: Record<string, { type: string; storage?: 'static' | 'input' | 'extern'; dimensions: Array<number | null>; initialValue?: string }>;
  properties: Record<string, string[]>;
}

import { Declaration, ClassDeclaration, FunctionDeclaration, VariableDeclaration } from './parser';
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
  const runtime: Runtime = { enums: {}, classes: {}, functions: {}, variables: {}, properties: {} };

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
      const methods: RuntimeClassMethod[] = classDecl.methods.map((m) => ({
        name: m.name,
        returnType: m.returnType,
        parameters: m.parameters.map((p) => ({
          type: p.paramType,
          byRef: p.byRef,
          name: p.name,
          dimensions: p.dimensions,
          defaultValue: p.defaultValue,
        })),
        visibility: m.visibility,
      }));
      runtime.classes[decl.name] = { base: classDecl.base, fields, methods };
    } else if (decl.type === 'FunctionDeclaration') {
      const fn = decl as FunctionDeclaration;
      const params = fn.parameters.map((p) => ({
        type: p.paramType,
        byRef: p.byRef,
        name: p.name,
        dimensions: p.dimensions,
        defaultValue: p.defaultValue,
      }));
      if (!runtime.functions[fn.name]) {
        runtime.functions[fn.name] = [];
      }
      runtime.functions[fn.name].push({ returnType: fn.returnType, parameters: params });
    } else if (decl.type === 'VariableDeclaration') {
      const v = decl as VariableDeclaration;
      runtime.variables[v.name] = {
        type: v.varType,
        storage: v.storage,
        dimensions: v.dimensions,
        initialValue: v.initialValue,
      };
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
  const overloads = runtime.functions[name];
  const builtin = getBuiltin(name);

  if ((!overloads || overloads.length === 0) && !builtin) {
    throw new Error(`Function ${name} not found`);
  }

  let decl: { returnType: string; parameters: RuntimeFunctionParameter[] } | undefined;
  if (overloads && overloads.length) {
    let required = 0;
    for (const candidate of overloads) {
      required = candidate.parameters.filter((p) => p.defaultValue === undefined).length;
      if (args.length >= required && args.length <= candidate.parameters.length) {
        decl = candidate;
        break;
      }
    }
    if (decl) {
      const finalArgs: any[] = [];
      for (let i = 0; i < decl.parameters.length; i++) {
        const p = decl.parameters[i];
        if (i < args.length) {
          finalArgs.push(args[i]);
        } else if (p.defaultValue !== undefined) {
          finalArgs.push(cast(p.defaultValue, p.type as PrimitiveType));
        }
      }
      if (args.length > decl.parameters.length) {
        throw new Error('Too many arguments');
      }
      if (args.length < required) {
        throw new Error(`Missing argument ${decl.parameters[args.length].name}`);
      }
      args = finalArgs.slice(0, decl.parameters.length);
    } else if (!builtin) {
      throw new Error('Too many arguments');
    }
  }

  if (!builtin) {
    // TODO: interpret user-defined function bodies
    throw new Error(`Function ${name} has no implementation`);
  }

  return builtin(...args);
}

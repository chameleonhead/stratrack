export interface RuntimeClassField {
  type: string;
  dimensions: Array<number | null>;
  static?: boolean;
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
  static?: boolean;
  virtual?: boolean;
  pure?: boolean;
  locals: VariableDeclaration[];
  body?: string;
}

export interface Runtime {
  enums: Record<string, Record<string, number>>;
  classes: Record<string, { base?: string; abstract?: boolean; templateParams?: string[]; fields: Record<string, RuntimeClassField>; methods: RuntimeClassMethod[] }>;
  functions: Record<string, { returnType: string; parameters: RuntimeFunctionParameter[]; locals: VariableDeclaration[]; body?: string; templateParams?: string[] }[]>;
  variables: Record<string, { type: string; storage?: 'static' | 'input' | 'extern'; dimensions: Array<number | null>; initialValue?: string }>;
  properties: Record<string, string[]>;
  /** Stored values of static local variables keyed by function name */
  staticLocals: Record<string, Record<string, any>>;
  /** Values of global variables */
  globalValues: Record<string, any>;
}

import { Declaration, ClassDeclaration, FunctionDeclaration, VariableDeclaration } from './parser';
import { getBuiltin } from './builtins';
import { cast, PrimitiveType } from './casting';
import { executeStatements } from './statements';

/** Options for executing code. */
export interface ExecutionContext {
  /** Entry point function name. */
  entryPoint?: string;
  /** Arguments to pass to the entry point. */
  args?: any[];
  /** Values for variables declared with the `input` keyword. */
  inputValues?: Record<string, any>;
  /** Values for variables declared with the `extern` keyword. */
  externValues?: Record<string, any>;
}

export function execute(
  declarations: Declaration[],
  entryPointOrContext?: string | ExecutionContext
): Runtime {
  const runtime: Runtime = {
    enums: {},
    classes: {},
    functions: {},
    variables: {},
    properties: {},
    staticLocals: {},
    globalValues: {
      _Digits: 0,
      _Point: 0,
      _LastError: 0,
      _Period: 0,
      _RandomSeed: 0,
      _StopFlag: 0,
      _Symbol: '',
      _UninitReason: 0,
      Bid: 0,
      Ask: 0,
      Bars: 0,
      Digits: 0,
      Point: 0,
      Open: [],
      High: [],
      Low: [],
      Close: [],
      Time: [],
      Volume: [],
    },
  };

  // Extract entry point and arguments. If provided, the entry point will be
  // invoked after the runtime is populated.
  const ctx =
    typeof entryPointOrContext === 'string'
      ? { entryPoint: entryPointOrContext, args: [] }
      : entryPointOrContext || { entryPoint: undefined, args: [] };
  const entryPoint = ctx.entryPoint;
  const entryArgs = ctx.args ?? [];
  const inputVals = ctx.inputValues ?? {};
  const externVals = ctx.externValues ?? {};
  // TODO: support a full execution context when function bodies are interpreted.

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
        fields[f.name] = { type: f.fieldType, dimensions: f.dimensions, static: f.static };
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
        static: m.static,
        virtual: m.virtual,
        pure: m.pure,
        locals: m.locals,
        body: m.body,
      }));
      runtime.classes[decl.name] = { base: classDecl.base, abstract: classDecl.abstract, templateParams: classDecl.templateParams, fields, methods };
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
      runtime.functions[fn.name].push({ returnType: fn.returnType, parameters: params, locals: fn.locals, body: fn.body, templateParams: fn.templateParams });
    } else if (decl.type === 'VariableDeclaration') {
      const v = decl as VariableDeclaration;
      if (runtime.variables[v.name] && v.storage === 'extern') {
        // don't overwrite existing definition
        continue;
      }
      runtime.variables[v.name] = {
        type: v.varType,
        storage: v.storage,
        dimensions: v.dimensions,
        initialValue: v.initialValue,
      };
      let val: any = undefined;
      if (v.storage === 'input') {
        if (inputVals[v.name] !== undefined) {
          val = inputVals[v.name];
        } else if (v.initialValue !== undefined) {
          try {
            val = cast(v.initialValue, v.varType as PrimitiveType);
          } catch {
            val = v.initialValue;
          }
        }
      } else if (v.storage === 'extern') {
        if (externVals[v.name] !== undefined) {
          val = externVals[v.name];
        } else if (v.initialValue !== undefined) {
          try {
            val = cast(v.initialValue, v.varType as PrimitiveType);
          } catch {
            val = v.initialValue;
          }
        }
      } else {
        if (v.initialValue !== undefined) {
          try {
            val = cast(v.initialValue, v.varType as PrimitiveType);
          } catch {
            val = v.initialValue;
          }
        }
      }
      runtime.globalValues[v.name] = val;
    }
  }

  for (const name in runtime.classes) {
    const cls = runtime.classes[name];
    if (cls.base && !runtime.classes[cls.base]) {
      throw new Error(`Base class ${cls.base} not found for ${name}`);
    }
  }



  if (entryPoint) {
    callFunction(runtime, entryPoint, entryArgs);
  }

  return runtime;
}

export function callFunction(runtime: Runtime, name: string, args: any[] = []): any {
  const overloads = runtime.functions[name];
  const builtin = getBuiltin(name);

  if ((!overloads || overloads.length === 0) && !builtin) {
    throw new Error(`Function ${name} not found`);
  }

  let decl: { returnType: string; parameters: RuntimeFunctionParameter[]; locals: VariableDeclaration[]; body?: string } | undefined;
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
      // initialize static local variables if needed
      if (!runtime.staticLocals[name]) runtime.staticLocals[name] = {};
      for (const local of decl.locals) {
        if (local.storage === 'static' && runtime.staticLocals[name][local.name] === undefined) {
          let val: any = undefined;
          if (local.initialValue !== undefined) {
            try {
              val = cast(local.initialValue, local.varType as PrimitiveType);
            } catch {
              val = local.initialValue;
            }
          }
          runtime.staticLocals[name][local.name] = val;
        }
      }
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
      for (let i = 0; i < decl.parameters.length; i++) {
        if (decl.parameters[i].byRef) {
          if (typeof args[i] !== 'object' || args[i] === null) {
            throw new Error(`Argument ${decl.parameters[i].name} must be passed by reference`);
          }
        }
      }
    } else if (!builtin) {
      throw new Error('Too many arguments');
    }
  }

  if (!builtin) {
    if (!decl || !decl.body) {
      throw new Error(`Function ${name} has no implementation`);
    }
    const env: any = {};
    for (const g in runtime.globalValues) {
      Object.defineProperty(env, g, {
        get() {
          return runtime.globalValues[g];
        },
        set(v: any) {
          runtime.globalValues[g] = v;
        },
        enumerable: true,
        configurable: true,
      });
    }
    for (let i = 0; i < decl.parameters.length; i++) {
      const p = decl.parameters[i];
      Object.defineProperty(env, p.name, { value: args[i], writable: true, enumerable: true });
    }
    for (const local of decl.locals) {
      let val: any = undefined;
      if (local.storage === 'static') {
        val = runtime.staticLocals[name][local.name];
      } else if (local.initialValue !== undefined) {
        try {
          val = cast(local.initialValue, local.varType as PrimitiveType);
        } catch {
          val = local.initialValue;
        }
      }
      Object.defineProperty(env, local.name, { value: val, writable: true, enumerable: true });
    }
    const res = executeStatements(decl.body, env, runtime);
    for (const local of decl.locals) {
      if (local.storage === 'static') {
        runtime.staticLocals[name][local.name] = env[local.name];
      }
    }
    return res.return;
  }

  return builtin(...args);
}

export function instantiate(runtime: Runtime, className: string): any {
  const cls = runtime.classes[className];
  if (!cls) throw new Error(`Class ${className} not found`);
  let obj: any = {};
  if (cls.base) {
    obj = { ...instantiate(runtime, cls.base) };
  }
  for (const fieldName in cls.fields) {
    const field = cls.fields[fieldName];
    obj[fieldName] = field.dimensions.length > 0 ? [] : undefined;
  }
  return obj;
}

export function callMethod(
  runtime: Runtime,
  className: string,
  methodName: string,
  obj: any,
  args: any[] = []
): any {
  let cls: any = runtime.classes[className];
  while (cls) {
    const method = cls.methods.find((m: RuntimeClassMethod) => m.name === methodName);
    if (method) {
      if (!method.body) throw new Error(`Method ${methodName} has no implementation`);
      if (!runtime.staticLocals[`${className}::${methodName}`])
        runtime.staticLocals[`${className}::${methodName}`] = {};
      const key = `${className}::${methodName}`;
      for (const local of method.locals) {
        if (
          local.storage === 'static' &&
          runtime.staticLocals[key][local.name] === undefined
        ) {
          let val: any = undefined;
          if (local.initialValue !== undefined) {
            try {
              val = cast(local.initialValue, local.varType as PrimitiveType);
            } catch {
              val = local.initialValue;
            }
          }
          runtime.staticLocals[key][local.name] = val;
        }
      }
      const env: any = {};
      for (const g in runtime.globalValues) {
        Object.defineProperty(env, g, {
          get() {
            return runtime.globalValues[g];
          },
          set(v: any) {
            runtime.globalValues[g] = v;
          },
          enumerable: true,
          configurable: true,
        });
      }
      Object.defineProperty(env, 'this', {
        value: obj,
        writable: false,
        enumerable: true,
      });
      for (const field in cls.fields) {
        Object.defineProperty(env, field, {
          get() {
            return obj[field];
          },
          set(v: any) {
            obj[field] = v;
          },
          enumerable: true,
        });
      }
      for (let i = 0; i < method.parameters.length; i++) {
        Object.defineProperty(env, method.parameters[i].name, { value: args[i], writable: true, enumerable: true });
      }
      for (const local of method.locals) {
        let val: any = undefined;
        if (local.storage === 'static') {
          val = runtime.staticLocals[key][local.name];
        } else if (local.initialValue !== undefined) {
          try {
            val = cast(local.initialValue, local.varType as PrimitiveType);
          } catch {
            val = local.initialValue;
          }
        }
        Object.defineProperty(env, local.name, { value: val, writable: true, enumerable: true });
      }
      const res = executeStatements(method.body!, env, runtime);
      for (const local of method.locals) {
        if (local.storage === 'static') {
          runtime.staticLocals[key][local.name] = env[local.name];
        }
      }
      return res.return;
    }
    if (!cls.base) break;
    cls = runtime.classes[cls.base];
  }
  throw new Error(`Method ${methodName} not found on ${className}`);
}

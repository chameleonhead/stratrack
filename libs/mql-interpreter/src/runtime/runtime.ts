import type {
  RuntimeState,
  ExecutionContext,
  RuntimeClassField,
  RuntimeFunctionParameter,
  RuntimeClassMethod,
} from "./types";
import {
  Declaration,
  ClassDeclaration,
  FunctionDeclaration,
  VariableDeclaration,
} from "../parser/parser";
import { getBuiltin, registerEnvBuiltins, BuiltinFunction } from "./builtins";
import { cast, PrimitiveType } from "./casting";
import { executeStatements } from "./statements";
import { DateTimeValue } from "./datetimeValue";
import { lex, Token, TokenType } from "../parser/lexer";

const numericTypes = new Set([
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
]);

function replaceEnumConstants(source: string, enums: Record<string, number>): string {
  if (!source) return source;
  const { tokens } = lex(source);
  const out: Token[] = [];
  for (const t of tokens) {
    if (t.type === TokenType.Identifier && enums[t.value] !== undefined) {
      out.push({
        type: TokenType.Number,
        value: String(enums[t.value]),
        line: t.line,
        column: t.column,
      });
    } else {
      out.push(t);
    }
  }
  return out
    .map((tok) =>
      tok.type === TokenType.String ? `"${tok.value.replace(/"/g, '\\"')}"` : tok.value
    )
    .join(" ");
}

function resolveValue(
  value: string | undefined,
  enums: Record<string, number>
): string | undefined {
  if (value === undefined) return value;
  if (enums[value] !== undefined) return String(enums[value]);
  return value;
}

function checkPrimitive(value: any, type: string): boolean {
  if (numericTypes.has(type)) return typeof value === "number" || value instanceof DateTimeValue;
  if (type === "bool") return typeof value === "boolean" || typeof value === "number";
  if (type === "string") return typeof value === "string";
  return true;
}

export function execute(
  declarations: Declaration[],
  entryPointOrContext?: string | ExecutionContext
): RuntimeState {
  const runtime: RuntimeState = {
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
      _Symbol: "",
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
    typeof entryPointOrContext === "string"
      ? { entryPoint: entryPointOrContext, args: [] }
      : entryPointOrContext || { entryPoint: undefined, args: [] };
  const entryPoint = ctx.entryPoint;
  const entryArgs = ctx.args ?? [];
  const inputVals = ctx.inputValues ?? {};
  const externVals = ctx.externValues ?? {};
  runtime.context = ctx;
  const enumMembers: Record<string, number> = {};

  for (const decl of declarations) {
    if (decl.type === "EnumDeclaration") {
      const members: Record<string, number> = {};
      let current = 0;
      for (const member of decl.members) {
        if (member.value !== undefined) {
          current = parseInt(member.value, 10);
        }
        members[member.name] = current;
        enumMembers[member.name] = current;
        current++;
      }
      runtime.enums[decl.name] = members;
    }
  }

  for (const decl of declarations) {
    if (decl.type === "EnumDeclaration") {
      continue;
    } else if (decl.type === "ClassDeclaration") {
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
          defaultValue: resolveValue(p.defaultValue, enumMembers),
        })),
        visibility: m.visibility,
        static: m.static,
        virtual: m.virtual,
        override: m.override,
        pure: m.pure,
        locals: m.locals.map((l) => ({
          ...l,
          initialValue: resolveValue(l.initialValue, enumMembers),
        })),
        body: replaceEnumConstants(m.body ?? "", enumMembers),
      }));
      runtime.classes[decl.name] = {
        base: classDecl.base,
        abstract: classDecl.abstract,
        templateParams: classDecl.templateParams,
        fields,
        methods,
      };
    } else if (decl.type === "FunctionDeclaration") {
      const fn = decl as FunctionDeclaration;
      const params = fn.parameters.map((p) => ({
        type: p.paramType,
        byRef: p.byRef,
        name: p.name,
        dimensions: p.dimensions,
        defaultValue: resolveValue(p.defaultValue, enumMembers),
      }));
      if (!runtime.functions[fn.name]) {
        runtime.functions[fn.name] = [];
      }
      runtime.functions[fn.name].push({
        returnType: fn.returnType,
        parameters: params,
        locals: fn.locals.map((l) => ({
          ...l,
          initialValue: resolveValue(l.initialValue, enumMembers),
        })),
        body: replaceEnumConstants(fn.body ?? "", enumMembers),
        templateParams: fn.templateParams,
      });
    } else if (decl.type === "VariableDeclaration") {
      const v = decl as VariableDeclaration;
      if (runtime.variables[v.name] && v.storage === "extern") {
        // don't overwrite existing definition
        continue;
      }
      const initValStr = resolveValue(v.initialValue, enumMembers);
      runtime.variables[v.name] = {
        type: v.varType,
        storage: v.storage,
        dimensions: v.dimensions,
        initialValue: initValStr,
      };
      let val: any = undefined;
      if (v.storage === "input") {
        if (inputVals[v.name] !== undefined) {
          val = inputVals[v.name];
        } else if (initValStr !== undefined) {
          try {
            val = cast(initValStr, v.varType as PrimitiveType);
          } catch {
            val = initValStr;
          }
        }
      } else if (v.storage === "extern") {
        if (externVals[v.name] !== undefined) {
          val = externVals[v.name];
        } else if (initValStr !== undefined) {
          try {
            val = cast(initValStr, v.varType as PrimitiveType);
          } catch {
            val = initValStr;
          }
        }
      } else {
        if (initValStr !== undefined) {
          try {
            val = cast(initValStr, v.varType as PrimitiveType);
          } catch {
            val = initValStr;
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

export function callFunction(runtime: RuntimeState, name: string, args: any[] = []): any {
  const overloads = runtime.functions[name];
  const builtin = getBuiltin(name);

  if ((!overloads || overloads.length === 0) && !builtin) {
    throw new Error(`Function ${name} not found`);
  }

  let decl:
    | {
        returnType: string;
        parameters: RuntimeFunctionParameter[];
        locals: VariableDeclaration[];
        body?: string;
      }
    | undefined;
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
        if (local.storage === "static" && runtime.staticLocals[name][local.name] === undefined) {
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
        throw new Error("Too many arguments");
      }
      if (args.length < required) {
        throw new Error(`Missing argument ${decl.parameters[args.length].name}`);
      }
      args = finalArgs.slice(0, decl.parameters.length);
      for (let i = 0; i < decl.parameters.length; i++) {
        if (decl.parameters[i].byRef) {
          if (typeof args[i] !== "object" || args[i] === null) {
            throw new Error(`Argument ${decl.parameters[i].name} must be passed by reference`);
          }
        }
        if (!decl.parameters[i].byRef && !checkPrimitive(args[i], decl.parameters[i].type)) {
          throw new Error(
            `Argument ${decl.parameters[i].name} expected ${decl.parameters[i].type}`
          );
        }
      }
    } else if (!builtin) {
      throw new Error("Too many arguments");
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
      let val = args[i];
      if (!p.byRef) {
        try {
          val = cast(val, p.type as PrimitiveType);
        } catch {
          /* ignore */
        }
      }
      Object.defineProperty(env, p.name, { value: val, writable: true, enumerable: true });
    }
    for (const local of decl.locals) {
      let val: any = undefined;
      if (local.storage === "static") {
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
      if (local.storage === "static") {
        runtime.staticLocals[name][local.name] = env[local.name];
      }
    }
    return res.return;
  }

  return builtin(...args);
}

export function instantiate(runtime: RuntimeState, className: string): any {
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
  Object.defineProperty(obj, "__class", { value: className, enumerable: false });
  return obj;
}

export function callMethod(
  runtime: RuntimeState,
  className: string,
  methodName: string,
  obj: any,
  args: any[] = []
): any {
  let checkCls: any = runtime.classes[className];
  let isVirtual = false;
  while (checkCls) {
    const m = checkCls.methods.find((mm: RuntimeClassMethod) => mm.name === methodName);
    if (m) {
      isVirtual = !!m.virtual;
      break;
    }
    if (!checkCls.base) break;
    checkCls = runtime.classes[checkCls.base];
  }
  let currentName = isVirtual && obj?.__class ? obj.__class : className;
  let cls: any = runtime.classes[currentName];
  while (cls) {
    const method = cls.methods.find((m: RuntimeClassMethod) => m.name === methodName);
    if (method) {
      if (!method.body) throw new Error(`Method ${methodName} has no implementation`);
      if (!runtime.staticLocals[`${currentName}::${methodName}`])
        runtime.staticLocals[`${currentName}::${methodName}`] = {};
      const key = `${currentName}::${methodName}`;
      for (const local of method.locals) {
        if (local.storage === "static" && runtime.staticLocals[key][local.name] === undefined) {
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
      Object.defineProperty(env, "this", {
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
        Object.defineProperty(env, method.parameters[i].name, {
          value: args[i],
          writable: true,
          enumerable: true,
        });
      }
      for (const local of method.locals) {
        let val: any = undefined;
        if (local.storage === "static") {
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
        if (local.storage === "static") {
          runtime.staticLocals[key][local.name] = env[local.name];
        }
      }
      return res.return;
    }
    if (!cls.base) break;
    currentName = cls.base;
    cls = runtime.classes[cls.base];
  }
  throw new Error(`Method ${methodName} not found on ${currentName}`);
}

export class Runtime {
  private state?: RuntimeState;

  run(
    ast: Declaration[],
    options: {
      libs?: Record<string, BuiltinFunction>;
      entryPoint?: string;
      args?: any[];
      inputValues?: Record<string, any>;
      externValues?: Record<string, any>;
    } = {}
  ): RuntimeState {
    if (options.libs) {
      registerEnvBuiltins(options.libs);
    }
    this.state = execute(ast, {
      entryPoint: options.entryPoint,
      args: options.args,
      inputValues: options.inputValues,
      externValues: options.externValues,
    });
    return this.state;
  }

  getState(): RuntimeState | undefined {
    return this.state;
  }
}

import { lex, TokenType } from "../parser/lexer";
import { Declaration, ClassDeclaration, ClassMethod } from "../parser/ast";
import { BuiltinSignaturesMap } from "../libs/signatures";
import { coreBuiltins, envBuiltins } from "../libs/builtins/registry";
import { warnings as warningDefinitions } from "../parser/warnings";
import { SymbolTable } from "./symbols";

export interface SemanticError {
  message: string;
  line: number;
  column: number;
  code?: string;
}

export function checkTypes(ast: Declaration[]): SemanticError[] {
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
  const symbols = new SymbolTable();

  for (const decl of ast) {
    if (decl.type === "ClassDeclaration") {
      classes.add(decl.name);
      symbols.define({
        name: decl.name,
        kind: "type",
        type: decl.name,
        scopeLevel: 0,
      });
    }
    if (decl.type === "EnumDeclaration") {
      enums.add(decl.name);
      symbols.define({
        name: decl.name,
        kind: "type",
        type: decl.name,
        scopeLevel: 0,
      });
    }
  }

  const isKnown = (t: string) => primitive.has(t) || classes.has(t) || enums.has(t);
  const errors: SemanticError[] = [];

  for (const decl of ast) {
    if (decl.type === "VariableDeclaration") {
      if (symbols.lookup(decl.name)) {
        errors.push({
          message: `Symbol ${decl.name} already defined`,
          line: decl.loc?.line ?? 0,
          column: decl.loc?.column ?? 0,
        });
      } else {
        symbols.define({
          name: decl.name,
          kind: "variable",
          type: decl.varType,
          scopeLevel: 0,
        });
      }
      if (!isKnown(decl.varType)) {
        errors.push({
          message: `Unknown type ${decl.varType}`,
          line: decl.loc?.line ?? 0,
          column: decl.loc?.column ?? 0,
        });
      }
    } else if (decl.type === "FunctionDeclaration") {
      if (symbols.lookup(decl.name)) {
        errors.push({
          message: `Symbol ${decl.name} already defined`,
          line: decl.loc?.line ?? 0,
          column: decl.loc?.column ?? 0,
        });
      } else {
        symbols.define({
          name: decl.name,
          kind: "function",
          type: decl.returnType,
          scopeLevel: 0,
        });
      }
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

export function validateFunctionCalls(
  ast: Declaration[],
  builtinSignatures: BuiltinSignaturesMap
): SemanticError[] {
  const errors: SemanticError[] = [];
  const builtinSet = new Set([
    ...Object.keys(builtinSignatures),
    ...Object.keys(coreBuiltins),
    ...Object.keys(envBuiltins),
  ]);

  const functionMap = new Map<string, { required: number; max: number }[]>();
  for (const decl of ast) {
    if (decl.type === "FunctionDeclaration") {
      const required = decl.parameters.filter((p) => p.defaultValue === undefined).length;
      const max = decl.parameters.length;
      const arr = functionMap.get(decl.name) || [];
      arr.push({ required, max });
      functionMap.set(decl.name, arr);
    }
  }

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
        const overloads = functionMap.get(name);
        const sig = builtinSignatures[name];
        const isBuiltin = builtinSet.has(name) || !!sig;
        if (!overloads && !isBuiltin) {
          errors.push({
            message: `Unknown function ${name}`,
            line: loc?.line ?? 0,
            column: loc?.column ?? 0,
          });
        } else if (overloads) {
          const required = Math.min(...overloads.map((o) => o.required));
          const max = Math.max(...overloads.map((o) => o.max));
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
            const required = s.args.filter((p) => !p.optional).length;
            const max = s.args.some((p) => p.variadic) ? Infinity : s.args.length;
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

export function validateOverrides(ast: Declaration[]): SemanticError[] {
  const diagnostics: SemanticError[] = [];
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

export function semanticCheck(
  ast: Declaration[],
  builtinSignatures: BuiltinSignaturesMap
): SemanticError[] {
  return [...checkTypes(ast), ...validateFunctionCalls(ast, builtinSignatures)];
}

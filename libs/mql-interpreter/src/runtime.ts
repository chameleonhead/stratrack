export interface RuntimeClassField {
  type: string;
  dimensions: Array<number | null>;
}

export interface Runtime {
  enums: Record<string, Record<string, number>>;
  classes: Record<string, { base?: string; fields: Record<string, RuntimeClassField> }>;
}

import { Declaration, ClassDeclaration } from './parser';

/** Options for executing code. */
export interface ExecutionContext {
  /** Entry point function name. */
  entryPoint?: string;
}

export function execute(
  declarations: Declaration[],
  entryPointOrContext?: string | ExecutionContext
): Runtime {
  const runtime: Runtime = { enums: {}, classes: {} };

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

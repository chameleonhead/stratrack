export interface Runtime {
  enums: Record<string, Record<string, number>>;
  classes: Record<string, { base?: string }>;
}

import { Declaration } from './parser';

export function execute(declarations: Declaration[]): Runtime {
  const runtime: Runtime = { enums: {}, classes: {} };

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
      runtime.classes[decl.name] = { base: decl.base };
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

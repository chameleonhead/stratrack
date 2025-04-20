import {
  MqlClass,
  MqlClassField,
  MqlClassMethod,
  MqlConstructor,
  MqlDeclaration,
  MqlDestructor,
  MqlExpr,
  MqlFunction,
  MqlProgram,
  MqlStatement,
} from "./ast";

export function renderMqlProgram(program: MqlProgram): string {
  const lines: string[] = [];

  lines.push("#property strict");
  lines.push(...program.properties.map((p) => `#property ${p}`));

  if (program.buffers && program.buffers.length > 0) {
    lines.push("");
    for (const buffer of program.buffers) {
      lines.push(`double ${buffer.name}[];`);
      if (buffer.label) lines.push(`#property indicator_label${buffer.index} "${buffer.label}"`);
      if (buffer.style) lines.push(`#property indicator_type${buffer.index} ${buffer.style}`);
    }
  }

  if (program.classes && program.classes.length > 0) {
    for (const cls of program.classes) {
      lines.push("");
      lines.push(renderClass(cls));
    }
  }

  if (program.declarations && program.declarations.length > 0) {
    lines.push("");
    for (const decl of program.declarations) {
      lines.push(renderDeclaration(decl) + ";");
    }
  }

  for (const fn of program.functions) {
    lines.push("");
    lines.push(renderFunction(fn));
  }

  return lines.join("\n");
}

function renderClass(cls: MqlClass): string {
  const privateMembers: (MqlClassField | MqlClassMethod | MqlConstructor | MqlDestructor)[] = [];
  const publicMembers: (MqlClassField | MqlClassMethod | MqlConstructor | MqlDestructor)[] = [];

  for (const field of cls.fields) {
    if (field.access === "private") privateMembers.push(field);
    else publicMembers.push(field);
  }
  for (const method of cls.methods) {
    if (method.access === "private") privateMembers.push(method);
    else publicMembers.push(method);
  }
  if (cls.ctor) {
    if (cls.ctor.access === "private") privateMembers.push(cls.ctor);
    else publicMembers.push(cls.ctor);
  }
  if (cls.dtor) {
    if (cls.dtor.access === "private") privateMembers.push(cls.dtor);
    else publicMembers.push(cls.dtor);
  }

  const lines: string[] = [`class ${cls.name} {`];
  lines.push("private:");
  for (const member of privateMembers) {
    if (member.type === "field") {
      lines.push(indent(`${member.varType} ${member.name};`));
    } else if (member.type === "method") {
      lines.push(renderMethod(member));
    } else if (member.type === "constructor") {
      lines.push(renderConstructor(cls));
    } else if (member.type === "destructor") {
      lines.push(renderDestructor(cls));
    }
  }
  lines.push("public:");
  for (const member of publicMembers) {
    if (member.type === "field") {
      lines.push(indent(`${member.varType} ${member.name};`));
    } else if (member.type === "method") {
      lines.push(renderMethod(member));
    } else if (member.type === "constructor") {
      lines.push(renderConstructor(cls));
    } else if (member.type === "destructor") {
      lines.push(renderDestructor(cls));
    }
  }

  lines.push("};");
  return lines.join("\n");
}
function renderFunction(fn: MqlFunction): string {
  const args = fn.args.map((arg) => `${arg.type} ${arg.name}`).join(", ");
  const body = fn.body.map((stmt) => renderStatement(stmt)).join("\n");
  return `${fn.returnType} ${fn.name}(${args}) {\n${indent(body)}\n}`;
}

function renderMethod(method: MqlClassMethod): string {
  const args = method.args.map((arg) => `${arg.type} ${arg.name}`).join(", ");
  const body = method.body.map((stmt) => renderStatement(stmt)).join("\n");
  return `  ${method.returnType} ${method.name}(${args}) {\n${indent(body, 2)}\n  }`;
}

function renderConstructor(cls: MqlClass): string {
  const ctor = cls.ctor as MqlConstructor;
  const args = ctor.args.map((arg) => `${arg.type} ${arg.name}`).join(", ");
  const body = ctor.body.map((stmt) => renderStatement(stmt)).join("\n");
  return `  ${cls.name}(${args}) {\n${indent(body, 2)}\n  }`;
}

function renderDestructor(cls: MqlClass): string {
  const dtor = cls.dtor as MqlDestructor;
  const args = dtor.args.map((arg) => `${arg.type} ${arg.name}`).join(", ");
  const body = dtor.body.map((stmt) => renderStatement(stmt)).join("\n");
  return `  ~${cls.name}(${args}) {\n${indent(body, 2)}\n  }`;
}
function renderStatement(stmt: MqlStatement): string {
  switch (stmt.type) {
    case "decl_stmt":
      return renderDeclaration(stmt.decl) + ";";
    case "assign_stmt":
      return `${renderExpr(stmt.variable)} = ${renderExpr(stmt.value)};`;
    case "expr_stmt":
      return renderExpr(stmt.expr) + ";";
    case "return":
      return stmt.expr ? `return ${renderExpr(stmt.expr)};` : "return;";
    case "if": {
      const thenBranch = stmt.thenBranch
        .map(renderStatement)
        .map((s) => indent(s))
        .join("\n");
      const elseBranch = stmt.elseBranch
        ? `\nelse {\n${stmt.elseBranch
            .map(renderStatement)
            .map((s) => indent(s))
            .join("\n")}\n}`
        : "";
      return `if (${renderExpr(stmt.condition)}) {\n${thenBranch}\n}${elseBranch}`;
    }
    case "for":
      return `for (${renderStatement(stmt.init).replace(/;$/, "")}; ${renderExpr(stmt.condition)}; ${renderStatement(stmt.increment).replace(/;$/, "")}) {\n${stmt.body
        .map(renderStatement)
        .map((s) => indent(s))
        .join("\n")}\n}`;
    case "comment":
      return `// ${stmt.text}`;
  }
}
function renderExpr(expr: MqlExpr): string {
  switch (expr.type) {
    case "literal":
      return expr.value;
    case "var_ref":
      return expr.name;
    case "unary":
      return expr.before
        ? `${expr.operator}${renderExpr(expr.value)}`
        : `${renderExpr(expr.value)}${expr.operator}`;
    case "binary": {
      const left =
        expr.left.type === "binary" || expr.left.type === "ternary"
          ? `(${renderExpr(expr.left)})`
          : renderExpr(expr.left);
      const right =
        expr.right.type === "binary" || expr.right.type === "ternary"
          ? `(${renderExpr(expr.right)})`
          : renderExpr(expr.right);
      return `${left} ${expr.operator} ${right}`;
    }
    case "ternary": {
      const condition =
        expr.condition.type === "binary" || expr.condition.type === "ternary"
          ? `(${renderExpr(expr.condition)})`
          : renderExpr(expr.condition);
      const trueExpr =
        expr.trueExpr.type === "binary" || expr.trueExpr.type === "ternary"
          ? `(${renderExpr(expr.trueExpr)})`
          : renderExpr(expr.trueExpr);
      const falseExpr =
        expr.falseExpr.type === "binary" || expr.falseExpr.type === "ternary"
          ? `(${renderExpr(expr.falseExpr)})`
          : renderExpr(expr.falseExpr);
      return `${condition} ? ${trueExpr} : ${falseExpr}`;
    }
    case "cond":
      return "(" + expr.conditions.map(renderExpr).join(`) ${expr.operator} (`) + ")";
    case "call":
      return `${expr.name}(${expr.args.map(renderExpr).join(", ")})`;
    case "array_access":
      if (!expr.safe && expr.fallback) {
        return `(Bars > ${renderExpr(expr.index)} ? ${renderExpr(expr.array)}[${renderExpr(expr.index)}] : ${renderExpr(expr.fallback)})`;
      }
      return `${renderExpr(expr.array)}[${renderExpr(expr.index)}]`;
    case "member_access":
      return `${renderExpr(expr.object)}.${expr.member}`;
    case "method_call":
      return `${renderExpr(expr.object)}.${expr.method}(${expr.args.map(renderExpr).join(", ")})`;
  }
}
function indent(text: string, level = 1): string {
  const pad = "  ".repeat(level);
  return text
    .split("\n")
    .map((line) => pad + line)
    .join("\n");
}

function renderDeclaration(decl: MqlDeclaration): string {
  return decl.init
    ? `${decl.varType} ${decl.name} = ${renderExpr(decl.init)}`
    : `${decl.varType} ${decl.name}`;
}

import { PyClass, PyExpression, PyFunction, PyModule, PyStatement } from "./ast";

function indent(text: string, level = 1): string {
  const pad = "  ".repeat(level);
  return text.split("\n").map(line => pad + line).join("\n");
}

export function renderPythonBtProgram(node: PyModule): string {
  const lines: string[] = [];

  if (node.imports) {
    for (const imp of node.imports) {
      lines.push(`${imp}`);
    }
    lines.push("");
  }

  for (const cls of node.classes) {
    lines.push(renderClass(cls));
  }

  return lines.join("\n");
}

function renderClass(cls: PyClass): string {
  const base = cls.baseClasses?.length ? `(${cls.baseClasses.join(", ")})` : "";
  const lines: string[] = [`class ${cls.name}${base}:`];

  if (cls.methods.length === 0) {
    lines.push(indent("pass"));
  } else {
    for (const method of cls.methods) {
      lines.push(indent(renderFunction(method)));
    }
  }

  return lines.join("\n");
}

function renderFunction(fn: PyFunction): string {
  const args = fn.args.join(", ");
  const lines: string[] = [`def ${fn.name}(${args}):`];

  if (fn.body.length === 0) {
    lines.push(indent("pass"));
  } else {
    for (const stmt of fn.body) {
      lines.push(indent(renderStatement(stmt)));
    }
  }

  return lines.join("\n");
}

function renderStatement(stmt: PyStatement): string {
  switch (stmt.type) {
    case "assign":
      return `${renderExpr(stmt.target)} = ${renderExpr(stmt.value)}`;
    case "if": {
      const thenBody = stmt.thenBody.map(s => indent(renderStatement(s))).join("\n");
      const elseBody = stmt.elseBody?.map(s => indent(renderStatement(s))).join("\n");
      let result = `if ${renderExpr(stmt.condition)}:\n${thenBody}`;
      if (stmt.elseBody) {
        result += `\nelse:\n${elseBody}`;
      }
      return result;
    }
    case "expr_stmt":
      return renderExpr(stmt.expression);
    case "return":
      return stmt.value ? `return ${renderExpr(stmt.value)}` : "return";
    case "for":
      return `for ${stmt.variable} in ${renderExpr(stmt.iterable)}:\n${stmt.body.map(s => indent(renderStatement(s))).join("\n")}`;
    case "while":
      return `while ${renderExpr(stmt.condition)}:\n${stmt.body.map(s => indent(renderStatement(s))).join("\n")}`;
    case "break":
      return "break";
    case "continue":
      return "continue";
    case "pass":
      return "pass";
    case "comment":
      return `# ${stmt.text}`;
  }
}

function renderExpr(expr: PyExpression): string {
  switch (expr.type) {
    case "literal":
      if (typeof expr.value === "string") return `"${expr.value}"`;
      if (expr.value === null) return "None";
      return String(expr.value);
    case "variable":
      return expr.name;
    case "binary":
      return `${renderExpr(expr.left)} ${expr.operator} ${renderExpr(expr.right)}`;
    case "unary":
      return `${expr.operator}${renderExpr(expr.operand)}`;
    case "ternary":
      return `${renderExpr(expr.trueExpr)} if ${renderExpr(expr.condition)} else ${renderExpr(expr.falseExpr)}`;
    case "call":
      return `${renderExpr(expr.function)}(${expr.args.map(renderExpr).join(", ")})`;
    case "attribute":
      return `${renderExpr(expr.object)}.${expr.attr}`;
    case "subscript":
      return `${renderExpr(expr.value)}[${renderExpr(expr.index)}]`;
    case "compare":
      return `${renderExpr(expr.left)} ${expr.operators.map((op, i) => `${op} ${renderExpr(expr.comparators[i])}`).join(" ")}`;
    case "list":
      return `[${expr.elements.map(renderExpr).join(", ")}]`;
    case "dict":
      return `{${expr.entries.map(e => `${renderExpr(e.key)}: ${renderExpr(e.value)}`).join(", ")}}`;
  }
}

import { PyClass, PyExpression, PyFunction, PyModule, PyStatement } from "./ast";

function indent(text: string, level = 1): string {
  const pad = "  ".repeat(level);
  return text
    .split("\n")
    .map((line) => pad + line)
    .join("\n");
}

export function renderPythonBtProgram(node: PyModule): string {
  const lines: string[] = [];

  if (node.imports) {
    for (const imp of node.imports) {
      lines.push(renderStatement(imp));
    }
  }

  for (const cls of node.classes) {
    lines.push("");
    lines.push(renderClass(cls));
  }

  for (const fn of node.functions || []) {
    lines.push("");
    lines.push(renderFunction(fn));
  }

  if (node.main) {
    lines.push("");
    lines.push("if __name__ == '__main__':");
    for (const stmt of node.main) {
      lines.push(indent(renderStatement(stmt)));
    }
  }

  return lines.join("\n");
}

function renderClass(cls: PyClass): string {
  const base = cls.baseClasses?.length ? `(${cls.baseClasses.join(", ")})` : "";
  const lines: string[] = [`class ${cls.name}${base}:`];

  if (cls.fields.length > 0) {
    for (const field of cls.fields) {
      lines.push(indent(renderStatement(field)));
    }
    lines.push("");
  }

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
    case "import":
      if (stmt.from) {
        return `from ${stmt.from} import ${stmt.name}`;
      }
      return `import ${stmt.name}`;
    case "class":
      return renderClass(stmt);
    case "function":
      return renderFunction(stmt);
    case "assign":
      return `${renderExpr(stmt.target)} = ${renderExpr(stmt.value)}`;
    case "if": {
      const thenBody = stmt.thenBody.map((s) => indent(renderStatement(s))).join("\n");
      const elseBody = stmt.elseBody?.map((s) => indent(renderStatement(s))).join("\n");
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
      return `for ${stmt.variable} in ${renderExpr(stmt.iterable)}:\n${stmt.body.map((s) => indent(renderStatement(s))).join("\n")}`;
    case "while":
      return `while ${renderExpr(stmt.condition)}:\n${stmt.body.map((s) => indent(renderStatement(s))).join("\n")}`;
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
      if (typeof expr.value === "boolean") return expr.value === true ? "True" : "False";
      if (expr.value === null) return "None";
      return String(expr.value);
    case "variable":
      return expr.name;
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
    case "unary": {
      const operand =
        expr.operand.type === "binary" || expr.operand.type === "ternary"
          ? `(${renderExpr(expr.operand)})`
          : renderExpr(expr.operand);
      if (expr.operator === "not") {
        return `not ${operand}`;
      }
      if (expr.operator === "abs") {
        return `abs(${operand})`;
      }
      return `${expr.operator}${operand}`;
    }
    case "ternary": {
      const condition =
        expr.condition.type === "compare"
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
      return `${trueExpr} if ${condition} else ${falseExpr}`;
    }
    case "call":
      return `${renderExpr(expr.function)}(${expr.args.map(renderExpr).join(", ")})`;
    case "attribute":
      return `${renderExpr(expr.object)}.${expr.attr}`;
    case "subscript":
      return `${renderExpr(expr.value)}[${renderExpr(expr.index)}]`;
    case "slice": {
      const start = expr.start ? renderExpr(expr.start) : "";
      const stop = expr.stop ? renderExpr(expr.stop) : "";
      const step = expr.step ? renderExpr(expr.step) : "";
      if (start && stop && step) {
        return `${start}:${stop}:${step}`;
      } else if (start && stop) {
        return `${start}:${stop}`;
      } else if (start) {
        return `${start}:`;
      } else if (stop) {
        return `:${stop}`;
      }
      return ":";
    }
    case "compare": {
      const left =
        expr.left.type === "binary" || expr.left.type === "ternary"
          ? `(${renderExpr(expr.left)})`
          : renderExpr(expr.left);
      return `${left} ${expr.operators
        .map((op, i) => ({
          op,
          comp:
            expr.comparators[i].type === "binary" || expr.comparators[i].type === "ternary"
              ? `(${renderExpr(expr.comparators[i])})`
              : renderExpr(expr.comparators[i]),
        }))
        .map(({ op, comp }) => `${op} ${comp}`)
        .join(" ")}`;
    }
    case "logical":
      return `(${expr.conditions.map(renderExpr).join(` ${expr.operator} `)})`;
    case "list":
      return `[${expr.elements.map(renderExpr).join(", ")}]`;
    case "dict":
      return `{${expr.entries.map((e) => `${renderExpr(e.key)}: ${renderExpr(e.value)}`).join(", ")}}`;
    case "tuple":
      return `(${expr.elements.map(renderExpr).join(", ")},)`;
    case "for_expr":
      return `for ${expr.variable} in ${renderExpr(expr.iterable)}: ${renderExpr(expr.body)}`;
  }
}

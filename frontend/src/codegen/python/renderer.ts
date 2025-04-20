import { PyModule, PyExpression, PyStatement, PyFunction, PyClass } from "./ast";

export function renderPythonBtProgram(module: PyModule): string {
  const emitExpr = (expr: PyExpression): string => {
    switch (expr.type) {
      case "literal":
        return JSON.stringify(expr.value);
      case "variable":
        return expr.name;
      case "attribute":
        return `${emitExpr(expr.object)}.${expr.attr}`;
      case "call":
        return `${emitExpr(expr.function)}(${expr.args.map(emitExpr).join(", ")})`;
      case "binary":
        return `(${emitExpr(expr.left)} ${expr.operator} ${emitExpr(expr.right)})`;
      case "unary":
        return `${expr.operator}(${emitExpr(expr.operand)})`;
      case "compare":
        return `${emitExpr(expr.left)} ${expr.operators.map((op, i) => `${op} ${emitExpr(expr.comparators[i])}`).join(" ")}`;
      case "subscript":
        return `${emitExpr(expr.value)}[${emitExpr(expr.index)}]`;
      default:
        return "<expr>";
    }
  };

  const emitStmt = (stmt: PyStatement, indent: string): string => {
    switch (stmt.type) {
      case "assign":
        return `${indent}${emitExpr(stmt.target)} = ${emitExpr(stmt.value)}`;
      case "expr_stmt":
        return `${indent}${emitExpr(stmt.expression)}`;
      case "return":
        return `${indent}return${stmt.value ? " " + emitExpr(stmt.value) : ""}`;
      case "comment":
        return `${indent}# ${stmt.text}`;
      case "if": {
        const thenLines = stmt.thenBody.map((s) => emitStmt(s, indent + "    ")).join("\n");
        const elseLines = stmt.elseBody?.map((s) => emitStmt(s, indent + "    ")).join("\n");
        return (
          `${indent}if ${emitExpr(stmt.condition)}:\n${thenLines}` +
          (elseLines ? `\n${indent}else:\n${elseLines}` : "")
        );
      }
      default:
        return `${indent}pass  # <stmt>`;
    }
  };

  const emitFunc = (f: PyFunction): string => {
    const head = `def ${f.name}(${f.args.join(", ")}):`;
    const body = f.body.length > 0 ? f.body.map((s) => emitStmt(s, "    ")).join("\n") : "    pass";
    return `${head}\n${body}`;
  };

  const emitClass = (c: PyClass): string => {
    const base = c.baseClasses?.length ? `(${c.baseClasses.join(", ")})` : "";
    const body = c.methods.length > 0 ? c.methods.map(emitFunc).join("\n\n") : "    pass";
    return `class ${c.name}${base}:\n${body}`;
  };

  const header = module.imports?.join("\n") ?? "";
  const classes = module.classes.map(emitClass).join("\n\n");
  return [header, classes].filter(Boolean).join("\n\n");
}

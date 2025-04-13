import { Condition, ConditionOperand, StrategyTemplate, VariableExpression } from "../types";

export abstract class PyBlock {
  indentLevel = 0;

  constructor(indentLevel = 0) {
    this.indentLevel = indentLevel;
  }

  protected indent(code: string, extra = 0) {
    const spaces = "    ".repeat(this.indentLevel + extra);
    return code
      .split("\n")
      .map((line) => (line.trim() ? spaces + line : line))
      .join("\n");
  }

  abstract toString(): string;
}

export class PyIf extends PyBlock {
  body: PyBlock[] = [];

  constructor(public condition: string) {
    super();
  }

  add(...lines: PyBlock[]) {
    lines.forEach((line) => {
      line.indentLevel = this.indentLevel + 1;
      this.body.push(line);
    });
    return this;
  }

  toString() {
    const header = `if ${this.condition}:`;
    const body = this.indent(
      this.body.length ? this.body.map((b) => b.toString()).join("\n") : "pass"
    );
    return `${header}\n${body}`;
  }
}

export class PyFor extends PyBlock {
  body: PyBlock[] = [];

  constructor(
    public variable: string,
    public iterable: string
  ) {
    super();
  }

  add(...lines: PyBlock[]) {
    lines.forEach((line) => {
      line.indentLevel = this.indentLevel + 1;
      this.body.push(line);
    });
    return this;
  }

  toString() {
    const header = this.indent(`for ${this.variable} in ${this.iterable}:`);
    const body = this.indent(
      this.body.length ? this.body.map((b) => b.toString()).join("\n") : "pass"
    );
    return `${header}\n${body}`;
  }
}

export class PyExpr extends PyBlock {
  constructor(public expression: string) {
    super();
  }

  toString() {
    return this.expression;
  }
}

export class PyAssignment extends PyBlock {
  constructor(
    public variable: string,
    public value: string
  ) {
    super();
  }

  toString() {
    return `${this.variable} = ${this.value}`;
  }
}

export class PyFunction extends PyBlock {
  body: PyBlock[] = [];

  constructor(
    public name: string,
    public args: string[] = []
  ) {
    super();
  }

  add(...lines: PyBlock[]) {
    lines.forEach((line) => {
      line.indentLevel = this.indentLevel + 1;
      this.body.push(line);
    });
    return this;
  }

  toString() {
    const header = `def ${this.name}(${this.args.join(", ")}):`;
    const body = this.indent(
      this.body.length ? this.body.map((b) => b.toString()).join("\n") : "pass"
    );
    return `${header}\n${body}`;
  }
}

export class PyReturn extends PyBlock {
  constructor(public value?: string) {
    super();
  }

  toString() {
    return `return${this.value ? " " + this.value : ""}`;
  }
}

export class PyComment extends PyBlock {
  constructor(public comment: string) {
    super();
  }

  toString() {
    return this.indent(`# ${this.comment}`);
  }
}

export class PyClass extends PyBlock {
  body: PyBlock[] = [];

  constructor(
    public name: string,
    public baseClass?: string
  ) {
    super();
  }

  add(...lines: PyBlock[]) {
    lines.forEach((line) => {
      line.indentLevel = this.indentLevel + 1;
      this.body.push(line);
    });
    return this;
  }

  toString() {
    const base = this.baseClass ? `(${this.baseClass})` : "";
    const header = `class ${this.name}${base}:`;
    const body = this.indent(
      this.body.length ? this.body.map((b) => b.toString()).join("\n") : "pass",
      1
    );
    return `${header}\n${body}`;
  }
}

export class PyImport extends PyBlock {
  constructor(
    public module: string,
    public names?: string[]
  ) {
    super();
  }

  toString() {
    if (this.names && this.names.length) {
      return `from ${this.module} import ${this.names.join(", ")}`;
    }
    return `import ${this.module}`;
  }
}

export class PyModule {
  imports: PyImport[] = [];
  body: PyBlock[] = [];

  addImport(line: PyImport) {
    this.imports.push(line);
    return this;
  }

  add(...blocks: PyBlock[]) {
    this.body.push(...blocks);
    return this;
  }

  toString(): string {
    return [this.imports.join("\n"), "", ...this.body.map((b) => b.toString())].join("\n");
  }
}

export function convertStrategyToPythonAst(template: StrategyTemplate) {
  const module = new PyModule().addImport(new PyImport("backtrader", ["bt"]));

  const cls = new PyClass("GeneratedStrategy", "bt.Strategy");
  const initFn = new PyFunction("__init__", ["self"]);

  initFn.add(new PyAssignment("self.order_history", "[]"));
  initFn.add(new PyAssignment("self.trade_history", "[]"));
  // Render variable definitions (indicators etc.)
  (template.variables || []).forEach((v) => {
    const varname = ["close"].includes(v.name) ? "__data_{v.name}" : v.name;
    const expr = emitVariableExpression(v.expression);
    initFn.add(new PyAssignment(`self.${varname}`, expr));
  });
  initFn.add(new PyAssignment("self.order", "None"));

  // Render notify_order() method
  const notifyOrderFn = new PyFunction("notify_order", ["self", "order"]);

  const orderStatusIf = new PyIf(
    "order.status in [order.Completed, order.Canceled, order.Rejected]"
  );
  orderStatusIf.add(new PyExpr("self.order_history.append(order)"));
  orderStatusIf.add(new PyAssignment("self.order", "None"));
  notifyOrderFn.add(orderStatusIf);

  // Render notify_trade() method
  const notifyTradeFn = new PyFunction("notify_trade", ["self", "trade"]);

  const tradeStatusIf = new PyIf("trade.isclosed");
  tradeStatusIf.add(new PyExpr("self.trade_history.append(trade)"));
  notifyTradeFn.add(tradeStatusIf);

  // Render next() method
  const nextFn = new PyFunction("next", ["self"]);

  const orderIf = new PyIf("self.order");
  orderIf.add(new PyReturn());
  nextFn.add(orderIf);

  const entryIf = new PyIf("not self.position");
  for (const entry of template.entry) {
    const condStr = emitCondition(entry.condition);
    const entryBlock = new PyIf(condStr);
    if (entry.type === "long") {
      entryBlock.add(new PyExpr("self.order = self.buy()"));
    } else {
      entryBlock.add(new PyExpr("self.order = self.sell()"));
    }
    entryIf.add(entryBlock);
  }

  nextFn.add(entryIf);

  const exitIf = new PyIf("self.position and self.position.size > 0");
  for (const exit of template.exit) {
    const condStr = emitCondition(exit.condition);
    const exitBlock = new PyIf(condStr);
    exitBlock.add(new PyExpr("self.order = self.close()"));
    exitIf.add(exitBlock);
  }

  nextFn.add(exitIf);

  cls.add(initFn);
  cls.add(notifyOrderFn);
  cls.add(notifyTradeFn);
  cls.add(nextFn);
  module.add(cls);
  return module;
}

function emitVariableExpression(expr: VariableExpression): string {
  switch (expr.type) {
    case "constant":
      return expr.value.toString();
    case "price": {
      const source = expr.source || "close";
      const shift = expr.shiftBars || 0;
      return shift === 0 ? `self.data.${source}` : `self.data.${source}(-${shift})`;
    }
    case "indicator": {
      const source = expr.source ? emitVariableExpression(expr.source) : "self.data.close";
      const params = expr.params || {};
      const paramStr = Object.entries(params)
        .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
        .join(", ");
      return `bt.indicators.${expr.name}(${source}${paramStr ? ", " + paramStr : ""})`;
    }
    case "variable":
      return `self.${expr.name}`;
    case "unary_op": {
      const inner = emitVariableExpression(expr.operand);
      return expr.operator === "abs" ? `abs(${inner})` : `-${inner}`;
    }
    case "binary_op": {
      const left = emitVariableExpression(expr.left);
      const right = emitVariableExpression(expr.right);
      return `(${left} ${expr.operator} ${right})`;
    }
    case "ternary": {
      const cond = emitCondition(expr.condition);
      const t = emitVariableExpression(expr.trueExpr);
      const f = emitVariableExpression(expr.falseExpr);
      return `(${t} if ${cond} else ${f})`;
    }
    default:
      return "0";
  }
}

function emitCondition(cond: Condition, shift: number = 0): string {
  switch (cond.type) {
    case "comparison":
      return `${emitOperand(cond.left, shift)} ${cond.operator} ${emitOperand(cond.right, shift)}`;
    case "cross": {
      const l_curr = emitOperand(cond.left, shift);
      const l_prev = emitOperand(cond.left, shift + 1);
      const r_curr = emitOperand(cond.right, shift);
      const r_prev = emitOperand(cond.right, shift + 1);
      if (cond.direction === "cross_over") {
        return `${l_prev} < ${r_prev} and ${l_curr} > ${r_curr}`;
      } else {
        return `${l_prev} > ${r_prev} and ${l_curr} < ${r_curr}`;
      }
    }
    case "state": {
      const conds = [];
      const sign = cond.state === "rising" ? ">" : "<";
      for (let i = 0; i < Math.abs(cond.length || 1); i++) {
        const var_curr = emitOperand(cond.operand, shift + i);
        const var_prev = emitOperand(cond.operand, shift + i + 1);
        conds.push(`${var_curr} ${sign} ${var_prev}`);
      }
      return conds.join(" and ");
    }
    case "continue": {
      const conds = [];
      for (let i = 0; i < Math.abs(cond.length || 2); i++) {
        const condition = emitCondition(cond.condition, shift + i);
        conds.push(condition);
      }
      return `${cond.continue === 'true' ? '' : 'not '}(${conds.join(" and ")})`;
    }
    case "change": {
      const inner_curr = emitCondition(cond.condition, shift);
      const inner_prev = emitCondition(cond.condition, shift);
      return cond.change === "to_true"
        ? `not (${inner_prev}) and (${inner_curr})`
        : `(${inner_prev}) and not (${inner_curr})`;
    }
    case "group":
      return "(" + cond.conditions.map(c => emitCondition(c, shift)).join(`) ${cond.operator} (`) + ")";
    default:
      return "False";
  }
}

function emitOperand(op: ConditionOperand, shift: number): string {
  if (op.type === "constant") return op.value?.toString() || "None";
  if (op.type === "variable") return `self.${op.name}[${-(shift + (op.shiftBars ?? 0))}]`;
  return "0";
}

// strategyCodeRenderer.ts

import { ConditionOperand } from "../types";
import { StrategyTemplate, VariableExpression, Condition } from "../types";
import {
  PyModule,
  PyImport,
  PyClass,
  PyFunction,
  PyAssignment,
  PyIf,
  PyExpr,
  PyReturn,
} from "./pythonCodeGenerator";

export function renderStrategyCode(template: StrategyTemplate): string {
  const module = new PyModule()
    .addImport(new PyImport("backtrader", ["bt"]))
    .addImport(new PyImport("datetime"));

  const cls = new PyClass("GeneratedStrategy", "bt.Strategy");
  const initFn = new PyFunction("__init__", ["self"]);

  // Render variable definitions (indicators etc.)
  (template.variables || []).forEach((v) => {
    const expr = renderExpression(v.expression);
    initFn.add(new PyAssignment(`self.${v.name}`, expr));
  });

  // Render next() method
  const nextFn = new PyFunction("next", ["self"]);


  const orderIf = new PyIf("not self.order")
  orderIf.add(new PyReturn())
  nextFn.add(orderIf)

  const entryIf = new PyIf("not self.position")
  for (const entry of template.entry) {
    const condStr = renderCondition(entry.condition);
    const entryBlock = new PyIf(condStr);
    if (entry.type === "long") {
      entryBlock.add(new PyExpr("self.buy()"));
    } else {
      entryBlock.add(new PyExpr("self.sell()"));
    }
    entryIf.add(entryBlock);
  }

  nextFn.add(entryIf)

  const exitIf = new PyIf("self.position and self.position.size > 0")
  for (const exit of template.exit) {
    const condStr = renderCondition(exit.condition);
    const exitBlock = new PyIf(condStr);
    exitBlock.add(new PyExpr("self.close()"));
    exitIf.add(exitBlock);
  }

  nextFn.add(exitIf)

  nextFn.add(new PyReturn());

  cls.add(initFn);
  cls.add(nextFn);
  module.add(cls);

  return module.toString();
}

function renderExpression(expr: VariableExpression): string {
  switch (expr.type) {
    case "price": {
      const source = expr.source || "close";
      const shift = expr.shiftBars || 0;
      return shift === 0 ? `self.data.${source}` : `self.data.${source}[-${shift}]`;
    }
    case "indicator": {
      const source = expr.source ? renderExpression(expr.source) : "self.data.close";
      const params = expr.params || {};
      const paramStr = Object.entries(params)
        .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
        .join(", ");
      return `bt.indicators.${expr.name}(${source}${paramStr ? ", " + paramStr : ""})`;
    }
    case "constant":
      return expr.value.toString();
    case "variable":
      return `self.${expr.name}`;
    case "unary_op": {
      const inner = renderExpression(expr.operand);
      return expr.operator === "abs" ? `abs(${inner})` : `-${inner}`;
    }
    case "binary_op": {
      const left = renderExpression(expr.left);
      const right = renderExpression(expr.right);
      return `(${left} ${expr.operator} ${right})`;
    }
    case "ternary": {
      const cond = renderCondition(expr.condition);
      const t = renderExpression(expr.trueExpr);
      const f = renderExpression(expr.falseExpr);
      return `(${t} if ${cond} else ${f})`;
    }
    default:
      return "0";
  }
}

function renderCondition(cond: Condition): string {
  switch (cond.type) {
    case "comparison":
      return `${renderOperand(cond.left)} ${cond.operator} ${renderOperand(cond.right)}`;
    case "cross": {
      const left = renderOperand(cond.left);
      const right = renderOperand(cond.right);
      if (cond.direction === "cross_over") {
        return `${left}[-1] < ${right} and ${left}[0] > ${right}`;
      } else {
        return `${left}[-1] > ${right} and ${left}[0] < ${right}`;
      }
    }
    case "state": {
      const op = renderOperand(cond.operand);
      const sign = cond.state === "rising" ? ">" : "<";
      return `${op}[0] ${sign} ${op}[-1]`;
    }
    case "change": {
      const inner = renderCondition(cond.condition);
      return cond.change === "to_true"
        ? `not (${inner}[-1]) and (${inner})`
        : `(${inner}[-1]) and not (${inner})`;
    }
    case "group":
      return cond.conditions.map(renderCondition).join(` ${cond.operator} `);
    default:
      return "False";
  }
}

function renderOperand(op: ConditionOperand): string {
  if (op.type === "constant") return op.value?.toString() || "None";
  if (op.type === "variable") return `self.${op.name}`;
  return "0";
}

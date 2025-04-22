import { AggregationType } from "../../dsl/common";
import { IRExpression, IRCondition, IRVariable } from "../../ir/ast";
import { PyExpression, PyStatement } from "../ast";
import { call, attr, ref, lit, unary, bin, sub, ternary, cmp, assign, and, or } from "../helper";

export function emitAggregation(
  method: AggregationType,
  source: PyExpression,
  period: PyExpression
): PyExpression {
  let btFuncName: string;
  switch (method) {
    case "sma":
      btFuncName = "SMA";
      break;
    case "ema":
      btFuncName = "EMA";
      break;
    case "rma":
      btFuncName = "RMA";
      break;
    case "lwma":
      btFuncName = "LWMA";
      break;
    case "smma":
      btFuncName = "SMMA";
      break;
    case "sum":
      btFuncName = "SumN";
      break;
    case "max":
      btFuncName = "Highest";
      break;
    case "min":
      btFuncName = "Lowest";
      break;
    case "std":
      btFuncName = "StdDev";
      break;
    case "median":
      btFuncName = "Median";
      break;
    case "mean_absolute_deviation":
      btFuncName = "MAD";
      break;
    default:
      btFuncName = "UnknownAgg";
      break;
  }

  return call(attr(ref("bt.ind"), btFuncName), [source, period]);
}
type EmitMode = "scalar" | "array";

export function emitPyExpr(
  expr: IRExpression,
  mode: EmitMode = "array",
  shift: number = 0
): PyExpression {
  switch (expr.type) {
    case "constant":
      return lit(expr.value);
    case "constant_param_ref":
      return attr(ref("self.params"), expr.name);
    case "source_param_ref": {
      const base = attr(ref("self.params"), expr.name);
      return mode === "scalar" ? sub(base, lit(shift)) : base;
    }
    case "variable_ref": {
      const base = attr(ref("self"), expr.name);
      return mode === "scalar" ? sub(base, lit(shift)) : base;
    }
    case "unary":
      return unary(expr.operator, emitPyExpr(expr.operand, mode, shift));
    case "binary":
      return bin(
        expr.operator,
        emitPyExpr(expr.left, mode, shift),
        emitPyExpr(expr.right, mode, shift)
      );
    case "price_ref": {
      const base = attr(ref("self.data"), expr.source);
      return mode === "scalar" ? sub(base, lit(shift)) : base;
    }
    case "bar_shift": {
      const base = emitPyExpr(expr.source, "array");
      if (expr.shiftBar) {
        if (mode === "scalar") {
          return sub(
            base,
            bin("+", emitPyExpr(expr.shiftBar, "scalar"), lit(shift)),
            expr.fallback ? emitPyExpr(expr.fallback, "scalar", shift) : undefined
          );
        } else {
          return call(ref("bt.LineDelay"), [
            base,
            bin("+", emitPyExpr(expr.shiftBar, "scalar"), lit(shift)),
          ]);
        }
      }
      if (mode === "scalar") {
        return sub(
          base,
          lit(shift),
          expr.fallback ? emitPyExpr(expr.fallback, "scalar", shift) : undefined
        );
      }
      return base;
    }
    case "aggregation": {
      const source = emitPyExpr(expr.source, "array");
      const period = emitPyExpr(expr.period, "scalar");
      return emitAggregation(expr.method, source, period);
    }
    case "aggregation_type_value":
      return lit(expr.method);
    case "indicator_ref": {
      const base = attr(ref("self"), expr.refId);
      return mode === "scalar" ? sub(base, lit(shift)) : base;
    }
    case "ternary":
      return ternary(
        emitPyCondExpr(expr.condition),
        emitPyExpr(expr.trueExpr, mode, shift),
        emitPyExpr(expr.falseExpr, mode, shift)
      );
    default:
      throw new Error(`Unsupported IR condition type: ${(expr as { type: string }).type}`);
  }
}

export function emitPyCondExpr(expr: IRCondition, shift: number = 0): PyExpression {
  switch (expr.type) {
    case "comparison": {
      return cmp(
        emitPyExpr(expr.left, "scalar", shift),
        [expr.operator],
        [emitPyExpr(expr.right, "scalar", shift)]
      );
    }
    case "cross": {
      const left = emitPyExpr(expr.left, "array");
      const right = emitPyExpr(expr.right, "array");
      const l_curr = sub(left, lit(0));
      const l_prev = sub(left, lit(1));
      const r_curr = sub(right, lit(0));
      const r_prev = sub(right, lit(1));
      return expr.direction === "cross_over"
        ? and(bin("<", l_prev, r_prev), bin(">", l_curr, r_curr))
        : and(bin(">", l_prev, r_prev), bin("<", l_curr, r_curr));
    }
    case "state": {
      const conds: PyExpression[] = [];
      const sign = expr.state === "rising" ? ">" : "<";
      const varName = emitPyExpr(expr.operand);
      for (let i = 0; i < Math.abs(expr.consecutiveBars || 1); i++) {
        conds.push(
          bin(sign, sub(varName, lit(shift + i), lit(0)), sub(varName, lit(shift + i + 1), lit(0)))
        );
      }
      return and(...conds);
    }
    case "change": {
      const conds: PyExpression[] = [];
      const preconditionBars = expr.preconditionBars || 1;
      const confirmationBars = expr.confirmationBars || 1;
      const totalPeriods = preconditionBars + confirmationBars;
      for (let i = 0; i < preconditionBars; i++) {
        if (expr.change === "to_true") {
          conds.push(unary("!", emitPyCondExpr(expr.condition, shift + (totalPeriods - i))));
        } else {
          conds.push(emitPyCondExpr(expr.condition, shift + (totalPeriods - i)));
        }
      }
      for (let i = 0; i < confirmationBars; i++) {
        if (expr.change === "to_true") {
          conds.push(emitPyCondExpr(expr.condition, shift + (totalPeriods - i)));
        } else {
          conds.push(
            unary(
              "!",
              emitPyCondExpr(expr.condition, shift + (totalPeriods - preconditionBars - i))
            )
          );
        }
      }
      return and(...conds);
    }
    case "continue": {
      const conds = [];
      for (let i = 0; i < Math.abs(expr.consecutiveBars || 2); i++) {
        const condition = emitPyCondExpr(expr.condition, shift + i);
        conds.push(condition);
      }
      return expr.continue === "true" ? and(...conds) : and(...conds.map((c) => unary("!", c)));
    }
    case "group":
      if (expr.operator === "and") {
        return and(...expr.conditions.map((c) => emitPyCondExpr(c, shift)));
      } else {
        return or(...expr.conditions.map((c) => emitPyCondExpr(c, shift)));
      }
    default:
      throw new Error(`Unsupported IR condition type: ${(expr as { type: string }).type}`);
  }
}

export function emitVariableAssign(v: IRVariable): PyStatement {
  return assign(attr(ref("self"), v.name), emitPyExpr(v.expression));
}

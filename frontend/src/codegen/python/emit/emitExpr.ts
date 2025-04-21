import { AggregationType } from "../../dsl/common";
import {
  IRExpression,
  IRAggregation,
  IRCondition,
  IRComparisonCondition,
  IRVariable,
} from "../../ir/ast";
import { PyExpression, PyStatement } from "../ast";
import { call, attr, ref, lit, unary, bin, sub, ternary, cmp, assign } from "../helper";

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

export function emitPyExpr(expr: IRExpression): PyExpression {
  switch (expr.type) {
    case "constant":
      return lit(expr.value);
    case "source_param_ref":
      return ref(expr.name);
    case "variable_ref":
      return attr(ref("self"), expr.name);
    case "unary":
      return unary(expr.operator, emitPyExpr(expr.operand));
    case "binary":
      return bin(expr.operator, emitPyExpr(expr.left), emitPyExpr(expr.right));
    case "price_ref":
      return attr(ref("self.data"), expr.source);
    case "bar_shift": {
      const base = emitPyExpr(expr.source);
      if (expr.shiftBar) {
        if (expr.shiftBar.type !== "constant" || expr.shiftBar.value !== 0) {
          return call(attr(base, "shift"), [emitPyExpr(expr.shiftBar)]);
        }
      }
      return base;
    }
    case "aggregation": {
      const agg = expr as IRAggregation;
      const source = emitPyExpr(agg.source);
      const period = emitPyExpr(agg.period);
      return emitAggregation(agg.method, source, period);
    }
    case "aggregation_type_value":
      return lit(expr.method); // used as literal value
    case "indicator_ref":
      return call(
        ref(expr.pascalName),
        expr.params
          .filter((p) => p.type === "variable_ref" || p.type == "source_param_ref")
          .map(emitPyExpr)
      );
    case "ternary":
      return ternary(
        emitPyCondExpr(expr.condition),
        emitPyExpr(expr.trueExpr),
        emitPyExpr(expr.falseExpr)
      );
    default:
      return ref("UNSUPPORTED_EXPR");
  }
}

export function emitPyCondExpr(cond: IRCondition): PyExpression {
  switch (cond.type) {
    case "comparison": {
      const c = cond as IRComparisonCondition;
      return cmp(emitPyExpr(c.left), [c.operator], [emitPyExpr(c.right)]);
    }
    case "cross": {
      const left = emitPyExpr(cond.left);
      const right = emitPyExpr(cond.right);
      return call(ref(cond.direction === "cross_over" ? "crossover" : "crossunder"), [left, right]);
    }
    case "state": {
      const base = emitPyExpr(cond.operand);
      const shifted = sub(base, lit(1));
      return cmp(base, [cond.state === "rising" ? ">" : "<"], [shifted]);
    }
    case "change":
    case "continue":
      return ref("UNSUPPORTED_CONDITION"); // TODO
    case "group": {
      const expressions = cond.conditions.map(emitPyCondExpr);
      return expressions.reduce((acc, curr) =>
        bin(cond.operator === "and" ? "and" : "or", acc, curr)
      );
    }
    default:
      return ref("INVALID_CONDITION");
  }
}

export function emitVariableAssign(v: IRVariable): PyStatement {
  return assign(attr(ref("self"), v.name), emitPyExpr(v.expression));
}

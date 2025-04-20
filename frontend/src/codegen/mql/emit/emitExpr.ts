import { IRCondition, IRExpression } from "../../ir/ast";
import {
  access,
  and,
  binary,
  call,
  lit,
  member,
  methodCall,
  or,
  ref,
  strlit,
  ternary,
  unary,
} from "../helper";
import { MqlExpr } from "../ast";

export function emitMqlExprFromIR(context: "strategy" | "indicator", expr: IRExpression, shift?: MqlExpr): MqlExpr {
  switch (expr.type) {
    case "constant":
      return lit(expr.value);
    case "temporary_variable_ref":
      return ref(expr.name);
    case "variable_ref":
      if (context === "strategy") {
        return ref(expr.name);
      } else {
        return member(ref("this"), expr.name);
      }
    case "price_ref":
      switch (expr.source) {
        case "open":
          return ref("Open");
        case "high":
          return ref("High");
        case "low":
          return ref("Low");
        case "close":
          return ref("Close");
        case "volume":
          return ref("Volume");
        default:
          throw new Error(`Unknown price source: ${expr.source}`);
      }
    case "bar_variable_ref": {
      const base = emitMqlExprFromIR(context, expr.source, shift);
      const shiftBars =
        typeof expr.shiftBar === "undefined" ? lit(0) : emitMqlExprFromIR(context, expr.shiftBar, shift);
      const fallback =
        typeof expr.fallback === "undefined" ? lit(0) : emitMqlExprFromIR(context, expr.fallback, shift);
      const index = typeof shift === "undefined" ? shiftBars : binary("+", shiftBars, shift);
      const isSafe = index.type === "literal" && index.value === "0";
      return access(base, index, isSafe, fallback);
    }
    case "unary":
      return unary(expr.operator, emitMqlExprFromIR(context, expr.operand, shift));
    case "binary": {
      return binary(
        expr.operator,
        emitMqlExprFromIR(context, expr.left, shift),
        emitMqlExprFromIR(context, expr.right, shift)
      );
    }
    case "ternary":
      return ternary(
        emitMqlCondFromIR(context, expr.condition, shift),
        emitMqlExprFromIR(context, expr.trueExpr, shift),
        emitMqlExprFromIR(context, expr.falseExpr, shift)
      );
    case "aggregation":
      if (context === "strategy") {
        return call(expr.method, [
          emitMqlExprFromIR(context, expr.source),
          emitMqlExprFromIR(context, expr.period, shift),
        ]);
      } else {
        return methodCall(ref("this"), expr.method, [
          emitMqlExprFromIR(context, expr.source),
          emitMqlExprFromIR(context, expr.period, shift),
        ]);
      }
    case "indicator_ref":
      return methodCall(ref(expr.refId), "Get", [
        strlit(expr.lineName),
        shift ?? lit(0),
        ...expr.params
          .filter((p) => p.type !== "constant" && p.type !== "aggregation_type_value")
          .map((p) => emitMqlExprFromIR(context, p)),
      ]);
    case "aggregation_type_value":
      return lit(expr.method);
    default:
      throw new Error(`Unsupported IR expression type: ${(expr as { type: string }).type}`);
  }
}

export function emitMqlCondFromIR(context: "strategy" | "indicator", expr: IRCondition, shift?: MqlExpr): MqlExpr {
  switch (expr.type) {
    case "comparison":
      return binary(
        expr.operator,
        emitMqlExprFromIR(context, expr.left, shift),
        emitMqlExprFromIR(context, expr.right, shift ? binary("+", shift, lit(1)) : lit(1))
      );
    case "cross": {
      const curr = shift ? binary("+", shift, lit(0)) : lit(0);
      const prev = shift ? binary("+", shift, lit(1)) : lit(1);
      const lvar = emitMqlExprFromIR(context, expr.left);
      const rvar = emitMqlExprFromIR(context, expr.right);
      const l_curr = lvar.type === "var_ref" ? access(lvar, curr, false, lit(0)) : lvar;
      const l_prev = lvar.type === "var_ref" ? access(lvar, prev, false, lit(0)) : lvar;
      const r_curr = rvar.type === "var_ref" ? access(rvar, curr, false, lit(0)) : rvar;
      const r_prev = rvar.type === "var_ref" ? access(rvar, prev, false, lit(0)) : rvar;
      return expr.direction === "cross_over"
        ? and(binary("<", l_prev, r_prev), binary(">", l_curr, r_curr))
        : and(binary(">", l_prev, r_prev), binary("<", l_curr, r_curr));
    }
    case "state": {
      const conds: MqlExpr[] = [];
      const sign = expr.state === "rising" ? ">" : "<";
      const varName = emitMqlExprFromIR(context, expr.operand);
      for (let i = 0; i < Math.abs(expr.consecutiveBars || 1); i++) {
        conds.push(
          binary(
            sign,
            access(varName, shift ? binary("+", shift, lit(i)) : lit(i), false, lit(0)),
            access(varName, shift ? binary("+", shift, lit(i + 1)) : lit(i + 1), false, lit(0))
          )
        );
      }
      return and(...conds);
    }
    case "change": {
      const conds: MqlExpr[] = [];
      const preconditionBars = expr.preconditionBars || 1;
      const confirmationBars = expr.confirmationBars || 1;
      const totalPeriods = preconditionBars + confirmationBars;
      for (let i = 0; i < preconditionBars; i++) {
        if (expr.change === "to_true") {
          conds.push(
            unary(
              "!",
              emitMqlCondFromIR(
                context,
                expr.condition,
                shift ? binary("+", shift, lit(totalPeriods - i)) : lit(totalPeriods - i)
              )
            )
          );
        } else {
          conds.push(
            emitMqlCondFromIR(
              context,
              expr.condition,
              shift ? binary("+", shift, lit(totalPeriods - i)) : lit(totalPeriods - i)
            )
          );
        }
      }
      for (let i = 0; i < confirmationBars; i++) {
        if (expr.change === "to_true") {
          conds.push(
            emitMqlCondFromIR(
              context,
              expr.condition,
              shift
                ? binary("+", shift, lit(totalPeriods - preconditionBars - i))
                : lit(totalPeriods - preconditionBars - i)
            )
          );
        } else {
          conds.push(
            unary(
              "!",
              emitMqlCondFromIR(
                context,
                expr.condition,
                shift
                  ? binary("+", shift, lit(totalPeriods - preconditionBars - i))
                  : lit(totalPeriods - preconditionBars - i)
              )
            )
          );
        }
      }
      return and(...conds);
    }
    case "continue": {
      const conds = [];
      for (let i = 0; i < Math.abs(expr.consecutiveBars || 2); i++) {
        const condition = emitMqlCondFromIR(
          context,
          expr.condition,
          shift ? binary("+", shift, lit(i)) : lit(i)
        );
        conds.push(condition);
      }
      return expr.continue === "true" ? and(...conds) : and(...conds.map((c) => unary("!", c)));
    }
    case "group":
      if (expr.operator === "and") {
        return and(...expr.conditions.map((c) => emitMqlCondFromIR(context, c, shift)));
      } else {
        return or(...expr.conditions.map((c) => emitMqlCondFromIR(context, c, shift)));
      }
    default:
      throw new Error(`Unsupported IR condition type: ${(expr as { type: string }).type}`);
  }
}

import { AggregationType } from "../../dsl/common";
import { IRExpression, IRCondition, IRTimeframeExpression } from "../../ir/ast";
import { PyExpression, PyFunction } from "../ast";
import {
  call,
  attr,
  ref,
  lit,
  unary,
  bin,
  sub,
  ternary,
  cmp,
  and,
  or,
  fn,
  ret,
  assign,
  forStmt,
  forExpr,
  iff,
} from "../helper";
import { resolveTimeframeExpression, timeframeToMinutes } from "../../utils/timeframe";

export const BASE_TIMEFRAME = "1m";

export function emitAggregationMethod(method: AggregationType): PyFunction {
  switch (method) {
    case "sma":
      return fn(
        `_${method}`,
        ["self", "line", "period"],
        [
          ret(
            bin(
              "/",
              call(ref("sum"), [call(attr(ref("line"), "get"), [ref("period")])]),
              ref("period")
            )
          ),
        ]
      );
    case "ema":
      return fn(
        `_${method}`,
        ["self", "line", "period"],
        [
          assign(ref("alpha"), bin("/", lit(2), bin("+", ref("period"), lit(1)))),
          assign(ref("result"), call(attr(ref("line"), "get"), [ref("period")])),
          forStmt("i", call(ref("range"), [bin("+", unary("-", ref("period")), lit(1)), lit(0)]), [
            assign(
              ref("result"),
              bin(
                "+",
                bin("*", ref("alpha"), sub(ref("line"), ref("i"))),
                bin("*", bin("-", lit(1), ref("alpha")), ref("result"))
              )
            ),
          ]),
          ret(ref("result")),
        ]
      );

    case "rma":
      return fn(
        `_${method}`,
        ["self", "line", "period"],
        [
          assign(ref("result"), call(attr(ref("line"), "get"), [ref("period")])),
          assign(ref("alpha"), bin("/", lit(1), ref("period"))),
          forStmt("i", call(ref("range"), [bin("+", unary("-", ref("period")), lit(1)), lit(0)]), [
            assign(
              ref("result"),
              bin(
                "+",
                bin("*", ref("alpha"), sub(ref("line"), ref("i"))),
                bin("*", bin("-", lit(1), ref("alpha")), ref("result"))
              )
            ),
          ]),
          ret(ref("result")),
        ]
      );
    case "lwma":
      return fn(
        `_${method}`,
        ["self", "line", "period"],
        [
          assign(ref("weighted_sum"), lit(0)),
          assign(ref("weight_total"), lit(0)),
          forStmt("i", call(ref("range"), [ref("period")]), [
            assign(ref("weight"), bin("-", ref("period"), ref("i"))),
            assign(
              ref("weighted_sum"),
              bin(
                "+",
                ref("weighted_sum"),
                bin("*", sub(ref("line"), bin("-", unary("-", ref("i")), lit(1))), ref("weight"))
              )
            ),
            assign(ref("weight_total"), bin("+", ref("weight_total"), ref("weight"))),
          ]),
          ret(bin("/", ref("weighted_sum"), ref("weight_total"))),
        ]
      );
    case "smma":
      return fn(
        `_${method}`,
        ["self", "line", "period"],
        [
          assign(
            ref("result"),
            bin(
              "/",
              call(ref("sum"), [call(attr(ref("line"), "get"), [ref("period")])]),
              ref("period")
            )
          ),
          forStmt("i", call(ref("range"), [bin("+", unary("-", ref("period")), lit(1)), lit(0)]), [
            assign(
              ref("result"),
              bin(
                "/",
                bin(
                  "+",
                  bin("*", ref("result"), bin("-", ref("period"), lit(1))),
                  sub(ref("line"), ref("i"))
                ),
                ref("period")
              )
            ),
          ]),
          ret(ref("result")),
        ]
      );
    case "sum":
      return fn(
        `_${method}`,
        ["self", "line", "period"],
        [ret(call(ref("sum"), [call(attr(ref("line"), "get"), [ref("period")])]))]
      );
    case "max":
      return fn(
        `_${method}`,
        ["self", "line", "period"],
        [ret(call(ref("max"), [call(attr(ref("line"), "get"), [ref("period")])]))]
      );
    case "min":
      return fn(
        `_${method}`,
        ["self", "line", "period"],
        [ret(call(ref("min"), [call(attr(ref("line"), "get"), [ref("period")])]))]
      );
    case "std":
      return fn(
        `_${method}`,
        ["self", "line", "period"],
        [
          assign(
            ref("mean"),
            bin(
              "/",
              call(ref("sum"), [call(attr(ref("line"), "get"), [ref("period")])]),
              ref("period")
            )
          ),
          ret(
            bin(
              "**",
              bin(
                "/",
                call(ref("sum"), [
                  forExpr(
                    call(attr(ref("line"), "get"), [ref("period")]),
                    "x",
                    bin("**", bin("-", ref("x"), ref("mean")), lit(2))
                  ),
                ]),
                ref("period")
              ),
              lit(0.5)
            )
          ),
        ]
      );
    case "median":
      return fn(
        `_${method}`,
        ["self", "line", "period"],
        [
          assign(
            ref("sorted_window"),
            call(ref("sorted"), [call(attr(ref("line"), "get"), [ref("period")])])
          ), // sorted_window = sorted(line[-period:])
          assign(ref("mid"), bin("//", ref("period"), lit(2))),
          iff(
            bin("%", ref("period"), lit(2)),
            [
              ret(
                bin(
                  "/",
                  bin(
                    "+",
                    sub(ref("sorted_window"), bin("-", ref("mid"), lit(1))),
                    sub(ref("sorted_window"), ref("mid"))
                  ),
                  lit(2)
                )
              ),
            ],
            [ret(sub(ref("sorted_window"), ref("mid")))]
          ),
        ]
      );
    case "mean_absolute_deviation":
      return fn(
        `_${method}`,
        ["self", "line", "period"],
        [
          assign(
            ref("mean"),
            bin(
              "/",
              call(ref("sum"), [call(attr(ref("line"), "get"), [ref("period")])]),
              ref("period")
            )
          ),
          ret(
            bin(
              "/",
              call(ref("sum"), [
                forExpr(
                  call(attr(ref("line"), "get"), [ref("period")]),
                  "x",
                  bin("|", bin("-", ref("x"), ref("mean")), lit(0))
                ),
              ]),
              ref("period")
            )
          ),
        ]
      );
  }

  throw new Error(`Unsupported aggregation type: ${method}`);
}
type EmitMode = "scalar" | "array";

export function emitPyExpr(
  expr: IRExpression,
  mode: EmitMode = "array",
  shift: number = 0,
  baseTf: string = BASE_TIMEFRAME
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
      const tf = resolveTimeframeExpression(expr.timeframe as IRTimeframeExpression, baseTf);
      const ratio = timeframeToMinutes(tf) / timeframeToMinutes(baseTf);
      const adjShift = ratio === 1 ? lit(shift) : bin("//", lit(shift), lit(ratio));
      const base = attr(ref("self.lines"), `_${expr.name}`);
      return mode === "scalar" ? sub(base, unary("-", adjShift)) : base;
    }
    case "unary":
      return unary(expr.operator, emitPyExpr(expr.operand, mode, shift, baseTf));
    case "binary":
      return bin(
        expr.operator,
        emitPyExpr(expr.left, mode, shift, baseTf),
        emitPyExpr(expr.right, mode, shift, baseTf)
      );
    case "price_ref": {
      const tf = resolveTimeframeExpression(expr.timeframe as IRTimeframeExpression, baseTf);
      const ratio = timeframeToMinutes(tf) / timeframeToMinutes(baseTf);
      const adjShift = ratio === 1 ? lit(shift) : bin("//", lit(shift), lit(ratio));
      const base = attr(ref("self.data"), expr.source);
      return mode === "scalar"
        ? sub(base, unary("-", adjShift))
        : adjShift.type === "literal" && adjShift.value === 0
          ? base
          : call(base, [adjShift]);
    }
    case "bar_shift": {
      const tf = resolveTimeframeExpression(expr.timeframe as IRTimeframeExpression, baseTf);
      const base = emitPyExpr(expr.source, "array", 0, tf);
      const shiftBar = expr.shiftBar ? emitPyExpr(expr.shiftBar, "scalar", 0, baseTf) : lit(0);
      const ratio = timeframeToMinutes(tf) / timeframeToMinutes(baseTf);
      if (mode === "scalar") {
        const fallback = expr.fallback ? emitPyExpr(expr.fallback, "scalar") : undefined;
        // shiftBar + shift の合成
        let totalShift: PyExpression;
        if (shiftBar.type === "literal" && shift === 0) {
          totalShift = shiftBar;
        } else if (shiftBar.type === "literal" && shiftBar.value === 0) {
          totalShift = shift === 0 ? lit(0) : lit(shift);
        } else if (shift === 0) {
          totalShift = shiftBar;
        } else {
          totalShift = bin("+", shiftBar, lit(shift));
        }
        const adjusted = ratio === 1 ? totalShift : bin("//", totalShift, lit(ratio));
        const indexExpr =
          adjusted.type === "literal" && adjusted.value === 0 ? lit(0) : unary("-", adjusted);
        if (fallback) {
          return ternary(
            cmp(call(ref("len"), [base]), [">"], [totalShift]),
            sub(base, indexExpr),
            fallback
          );
        } else {
          return sub(base, indexExpr);
        }
      }
      const total =
        shiftBar.type === "literal" && shiftBar.value === 0
          ? lit(shift)
          : bin("+", shiftBar, lit(shift));
      const adjusted = ratio === 1 ? total : bin("//", total, lit(ratio));
      return adjusted.type === "literal" && adjusted.value === 0 ? base : call(base, [adjusted]);
    }
    case "aggregation": {
      const methodName = `_` + expr.method.toLowerCase();
      const source = emitPyExpr(expr.source, "array", 0, baseTf);
      const period = emitPyExpr(expr.period, "scalar", 0, baseTf);
      return call(attr(ref("self"), methodName), [
        shift > 0 ? call(attr(source, "get"), [period, lit(shift)]) : source,
        period,
      ]);
    }
    case "aggregation_type_value":
      return lit(expr.method);
    case "indicator_ref": {
      const base = attr(ref("self"), expr.refId);
      return mode === "scalar" ? sub(base, lit(shift)) : base;
    }
    case "ternary":
      return ternary(
        emitPyCondExpr(expr.condition, 0),
        emitPyExpr(expr.trueExpr, mode, shift, baseTf),
        emitPyExpr(expr.falseExpr, mode, shift, baseTf)
      );
    default:
      throw new Error(`Unsupported IR condition type: ${(expr as { type: string }).type}`);
  }
}

export function emitPyCondExpr(
  expr: IRCondition,
  shift: number = 0,
  baseTf: string = BASE_TIMEFRAME
): PyExpression {
  switch (expr.type) {
    case "comparison": {
      return cmp(
        emitPyExpr(expr.left, "scalar", shift, baseTf),
        [expr.operator],
        [emitPyExpr(expr.right, "scalar", shift, baseTf)]
      );
    }
    case "cross": {
      const l_curr = emitPyExpr(expr.left, "scalar", 0, baseTf);
      const l_prev = emitPyExpr(expr.left, "scalar", 1, baseTf);
      const r_curr = emitPyExpr(expr.right, "scalar", 0, baseTf);
      const r_prev = emitPyExpr(expr.right, "scalar", 1, baseTf);
      return expr.direction === "cross_over"
        ? and(bin("<", l_prev, r_prev), bin(">", l_curr, r_curr))
        : and(bin(">", l_prev, r_prev), bin("<", l_curr, r_curr));
    }
    case "state": {
      const conds: PyExpression[] = [];
      const sign = expr.state === "rising" ? ">" : "<";
      for (let i = 0; i < Math.abs(expr.consecutiveBars || 1); i++) {
        conds.push(
          bin(
            sign,
            emitPyExpr(expr.operand, "scalar", shift + i, baseTf),
            emitPyExpr(expr.operand, "scalar", shift + i + 1, baseTf)
          )
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
          conds.push(
            unary("!", emitPyCondExpr(expr.condition, shift + (totalPeriods - i), baseTf))
          );
        } else {
          conds.push(emitPyCondExpr(expr.condition, shift + (totalPeriods - i), baseTf));
        }
      }
      for (let i = 0; i < confirmationBars; i++) {
        if (expr.change === "to_true") {
          conds.push(emitPyCondExpr(expr.condition, shift + (totalPeriods - i), baseTf));
        } else {
          conds.push(
            unary(
              "!",
              emitPyCondExpr(expr.condition, shift + (totalPeriods - preconditionBars - i), baseTf)
            )
          );
        }
      }
      return and(...conds);
    }
    case "continue": {
      const conds = [];
      for (let i = 0; i < Math.abs(expr.consecutiveBars || 2); i++) {
        const condition = emitPyCondExpr(expr.condition, shift + i, baseTf);
        conds.push(condition);
      }
      return expr.continue === "true" ? and(...conds) : and(...conds.map((c) => unary("!", c)));
    }
    case "group":
      if (expr.operator === "and") {
        return and(...expr.conditions.map((c) => emitPyCondExpr(c, shift, baseTf)));
      } else {
        return or(...expr.conditions.map((c) => emitPyCondExpr(c, shift, baseTf)));
      }
    default:
      throw new Error(`Unsupported IR condition type: ${(expr as { type: string }).type}`);
  }
}

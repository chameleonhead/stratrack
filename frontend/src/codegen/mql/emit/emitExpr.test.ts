import { describe, it, expect } from "vitest";
import { IRExpression } from "../../ir/ast";
import { emitMqlExprFromIR } from "./emitExpr";
import { access, binary, call, lit, ref, unary } from "../helper";

describe("emitMqlExprFromIR higher timeframe", () => {
  it("adjusts variable reference index", () => {
    const expr: IRExpression = {
      type: "variable_ref",
      name: "seriesVar",
      timeframe: { type: "higher_timeframe", level: 1 },
    };
    const result = emitMqlExprFromIR("strategy", expr, lit(10));
    expect(result).toEqual(
      access(ref("seriesVar"), unary("-", binary("/", lit(10), lit(5))), false)
    );
  });

  it("emits price reference with higher timeframe", () => {
    const expr: IRExpression = {
      type: "price_ref",
      source: "close",
      timeframe: { type: "higher_timeframe", level: 1 },
    };
    const result = emitMqlExprFromIR("strategy", expr, lit(10));
    expect(result).toEqual(
      call("iClose", [lit("Symbol()"), ref("PERIOD_M5"), binary("/", lit(10), lit(5))])
    );
  });

  it("handles bar_shift with higher timeframe", () => {
    const expr: IRExpression = {
      type: "bar_shift",
      source: { type: "price_ref", source: "close" },
      shiftBar: { type: "constant", value: 3 },
      timeframe: { type: "higher_timeframe", level: 1 },
    };
    const result = emitMqlExprFromIR("strategy", expr);
    expect(result).toEqual(access(ref("Close"), binary("/", lit(3), lit(5)), false, lit(0)));
  });
});

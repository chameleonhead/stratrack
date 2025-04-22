// tests/emitter.test.ts
import { describe, it, expect } from "vitest";
import { IRExpression, IRCondition, IRVariable } from "../../ir/ast";
import { lit, sub, attr, ref, bin, cmp, assign, call } from "../helper";
import { emitPyExpr, emitPyCondExpr, emitVariableAssign } from "./emitExpr";
import { PyBinaryOp, PyCompare, PyLogicalOp } from "../ast";

describe("emitPyExpr", () => {
  it("emits a constant", () => {
    const expr: IRExpression = { type: "constant", value: 10 };
    expect(emitPyExpr(expr)).toEqual(lit(10));
  });

  it("emits a scalar variable reference", () => {
    const expr: IRExpression = { type: "variable_ref", name: "myVar" };
    expect(emitPyExpr(expr, "scalar")).toEqual(sub(attr(ref("self"), "myVar"), lit(0)));
  });

  it("emits a price_ref as array", () => {
    const expr: IRExpression = { type: "price_ref", source: "close" };
    expect(emitPyExpr(expr, "array")).toEqual(attr(ref("self.data"), "close"));
  });

  it("emits a binary expression", () => {
    const expr: IRExpression = {
      type: "binary",
      operator: "+",
      left: { type: "constant", value: 1 },
      right: { type: "constant", value: 2 },
    };
    expect(emitPyExpr(expr)).toEqual(bin("+", lit(1), lit(2)));
  });

  it("emits scalar bar_shift with constant shift", () => {
    const expr: IRExpression = {
      type: "bar_shift",
      source: { type: "price_ref", source: "close" },
      shiftBar: { type: "constant", value: 2 },
    };

    const result = emitPyExpr(expr, "scalar");
    expect(result).toEqual(sub(attr(ref("self.data"), "close"), lit(2)));
  });

  it("emits scalar bar_shift with additional shift", () => {
    const expr: IRExpression = {
      type: "bar_shift",
      source: { type: "price_ref", source: "close" },
      shiftBar: { type: "constant", value: 1 },
    };

    const result = emitPyExpr(expr, "scalar", 1);
    expect(result).toEqual(sub(attr(ref("self.data"), "close"), bin("+", lit(1), lit(1))));
  });

  it("emits array bar_shift with constant shift", () => {
    const expr: IRExpression = {
      type: "bar_shift",
      source: { type: "price_ref", source: "high" },
      shiftBar: { type: "constant", value: 3 },
    };

    const result = emitPyExpr(expr, "array");
    expect(result).toEqual(
      call(ref("bt.LineDelay"), [attr(ref("self.data"), "high"), bin("+", lit(3), lit(0))])
    );
  });

  it("emits array bar_shift with non-zero outer shift", () => {
    const expr: IRExpression = {
      type: "bar_shift",
      source: { type: "price_ref", source: "low" },
      shiftBar: { type: "constant", value: 2 },
    };

    const result = emitPyExpr(expr, "array", 2);
    expect(result).toEqual(
      call(ref("bt.LineDelay"), [attr(ref("self.data"), "low"), bin("+", lit(2), lit(2))])
    );
  });

  it("emits scalar bar_shift with no shiftBar (defaults to shift only)", () => {
    const expr: IRExpression = {
      type: "bar_shift",
      source: { type: "price_ref", source: "close" },
    };

    const result = emitPyExpr(expr, "scalar", 2);
    expect(result).toEqual(sub(attr(ref("self.data"), "close"), lit(2)));
  });

  it("emits array bar_shift with no shiftBar (identity)", () => {
    const expr: IRExpression = {
      type: "bar_shift",
      source: { type: "price_ref", source: "close" },
    };

    const result = emitPyExpr(expr, "array", 0);
    expect(result).toEqual(attr(ref("self.data"), "close"));
  });

  it("emits array bar_shift with variable shift", () => {
    const expr: IRExpression = {
      type: "bar_shift",
      source: { type: "price_ref", source: "volume" },
      shiftBar: {
        type: "constant_param_ref",
        name: "shiftPeriod",
      },
    };

    const result = emitPyExpr(expr, "array", 1);
    expect(result).toEqual(
      call(ref("bt.LineDelay"), [
        attr(ref("self.data"), "volume"),
        bin("+", attr(ref("self.params"), "shiftPeriod"), lit(1)),
      ])
    );
  });

  it("emits scalar bar_shift with variable shift", () => {
    const expr: IRExpression = {
      type: "bar_shift",
      source: { type: "price_ref", source: "close" },
      shiftBar: {
        type: "constant_param_ref",
        name: "offset",
      },
    };

    const result = emitPyExpr(expr, "scalar", 1);
    expect(result).toEqual(
      sub(attr(ref("self.data"), "close"), bin("+", attr(ref("self.params"), "offset"), lit(1)))
    );
  });
});

describe("emitPyCondExpr", () => {
  it("emits a comparison", () => {
    const cond: IRCondition = {
      type: "comparison",
      operator: ">",
      left: { type: "constant", value: 5 },
      right: { type: "constant", value: 3 },
    };
    expect(emitPyCondExpr(cond)).toEqual(cmp(lit(5), [">"], [lit(3)]));
  });

  it("emits cross_over condition", () => {
    const cond: IRCondition = {
      type: "cross",
      direction: "cross_over",
      left: { type: "price_ref", source: "close" },
      right: { type: "price_ref", source: "open" },
    };

    const expr = emitPyCondExpr(cond) as PyLogicalOp;
    expect(expr.type).toBe("logical");
    expect(expr.operator).toBe("and");
    expect(expr.conditions.length).toBe(2);
    expect(expr.conditions[0]).toMatchObject({ type: "binary", operator: "<" });
    expect(expr.conditions[1]).toMatchObject({ type: "binary", operator: ">" });
  });

  it("emits cross_under condition", () => {
    const cond: IRCondition = {
      type: "cross",
      direction: "cross_under",
      left: { type: "price_ref", source: "high" },
      right: { type: "price_ref", source: "low" },
    };

    const expr = emitPyCondExpr(cond) as PyLogicalOp;
    expect(expr.type).toBe("logical");
    expect(expr.operator).toBe("and");
    expect(expr.conditions[0]).toMatchObject({ type: "binary", operator: ">" });
    expect(expr.conditions[1]).toMatchObject({ type: "binary", operator: "<" });
  });

  it("emits rising state condition", () => {
    const cond: IRCondition = {
      type: "state",
      state: "rising",
      operand: { type: "price_ref", source: "close" },
      consecutiveBars: 2,
    };

    const expr = emitPyCondExpr(cond, 1) as PyLogicalOp;
    expect(expr.type).toBe("logical");
    expect(expr.operator).toBe("and");
    expect(expr.conditions.length).toBe(2);
    expr.conditions.forEach((e) => expect(e).toMatchObject({ type: "binary", operator: ">" }));
    console.log(expr);
    expect((expr.conditions[0] as PyBinaryOp).left).toEqual({
      type: "subscript",
      value: { type: "attribute", object: { type: "variable", name: "self.data" }, attr: "close" },
      index: { type: "literal", value: 1 },
      fallback: { type: "literal", value: 0 },
    });
    expect((expr.conditions[0] as PyBinaryOp).right).toEqual({
      type: "subscript",
      value: { type: "attribute", object: { type: "variable", name: "self.data" }, attr: "close" },
      index: { type: "literal", value: 2 },
      fallback: { type: "literal", value: 0 },
    });
  });

  it("emits change to_true condition", () => {
    const cond: IRCondition = {
      type: "change",
      change: "to_true",
      preconditionBars: 1,
      confirmationBars: 2,
      condition: {
        type: "comparison",
        operator: ">",
        left: { type: "constant", value: 1 },
        right: { type: "constant", value: 0 },
      },
    };

    const expr = emitPyCondExpr(cond) as PyLogicalOp;
    expect(expr.type).toBe("logical");
    expect(expr.operator).toBe("and");
    expect(expr.conditions.length).toBe(3);
  });

  it("emits a continue true condition", () => {
    const cond: IRCondition = {
      type: "continue",
      continue: "true",
      consecutiveBars: 2,
      condition: {
        type: "comparison",
        operator: "==",
        left: { type: "bar_shift", source: { type: "variable_ref", name: "value1" } },
        right: { type: "constant", value: 1 },
      },
    };
    const expr = emitPyCondExpr(cond) as PyLogicalOp;
    expect(expr.type).toBe("logical");
    expect(expr.operator).toBe("and");
    expect(expr.conditions.length).toBe(2);
    expr.conditions.forEach((e) => expect(e).toMatchObject({ type: "compare", operators: ["=="] }));
    expect((expr.conditions[0] as PyCompare).left).toEqual({
      type: "subscript",
      value: {
        attr: "value1",
        object: {
          name: "self",
          type: "variable",
        },
        type: "attribute",
      },
      index: {
        type: "literal",
        value: 0,
      },
    });
    expect((expr.conditions[1] as PyCompare).left).toEqual({
      type: "subscript",
      value: {
        attr: "value1",
        object: {
          name: "self",
          type: "variable",
        },
        type: "attribute",
      },
      index: {
        type: "literal",
        value: 1,
      },
    });
  });

  it("emits continue false condition", () => {
    const cond: IRCondition = {
      type: "continue",
      continue: "false",
      consecutiveBars: 2,
      condition: {
        type: "comparison",
        operator: "==",
        left: { type: "constant", value: 1 },
        right: { type: "constant", value: 2 },
      },
    };

    const expr = emitPyCondExpr(cond) as PyLogicalOp;
    expect(expr.type).toBe("logical");
    expect(expr.operator).toBe("and");
    expect(expr.conditions.length).toBe(2);
    expr.conditions.forEach((e) => expect(e).toMatchObject({ type: "unary", operator: "!" }));
  });

  it("emits group condition with AND", () => {
    const cond: IRCondition = {
      type: "group",
      operator: "and",
      conditions: [
        {
          type: "comparison",
          operator: "==",
          left: { type: "constant", value: 1 },
          right: { type: "constant", value: 1 },
        },
        {
          type: "comparison",
          operator: "!=",
          left: { type: "constant", value: 2 },
          right: { type: "constant", value: 3 },
        },
      ],
    };

    const expr = emitPyCondExpr(cond) as PyLogicalOp;
    expect(expr.type).toBe("logical");
    expect(expr.operator).toBe("and");
    expect(expr.conditions.length).toBe(2);
  });

  it("emits group condition with OR", () => {
    const cond: IRCondition = {
      type: "group",
      operator: "or",
      conditions: [
        {
          type: "comparison",
          operator: "<",
          left: { type: "constant", value: 1 },
          right: { type: "constant", value: 2 },
        },
        {
          type: "comparison",
          operator: ">",
          left: { type: "constant", value: 5 },
          right: { type: "constant", value: 3 },
        },
      ],
    };

    const expr = emitPyCondExpr(cond) as PyLogicalOp;
    expect(expr.type).toBe("logical");
    expect(expr.operator).toBe("or");
    expect(expr.conditions.length).toBe(2);
  });
});

describe("emitVariableAssign", () => {
  it("emits a variable assignment", () => {
    const variable: IRVariable = {
      name: "myVar",
      expression: { type: "constant", value: 100 },
    };
    expect(emitVariableAssign(variable)).toEqual(assign(attr(ref("self"), "myVar"), lit(100)));
  });
});

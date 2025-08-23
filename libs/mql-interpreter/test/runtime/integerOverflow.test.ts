import { evaluateExpression } from "../../src/runtime/expression";
import { describe, it, expect } from "vitest";
import { DateTimeValue } from "../../src/runtime/datetimeValue";
import type { RuntimeState } from "../../src/runtime/types";

describe("integer overflow", () => {
  it("wraps 32-bit int overflow", () => {
    const result = evaluateExpression("2147483647 + 1");
    expect(result).toBe(-2147483648);
  });

  it("wraps 64-bit long overflow", () => {
    const result = evaluateExpression("9223372036854775807 + 1");
    expect(result).toBe(-9223372036854775808n);
  });

  it("mixes int and double without overflow", () => {
    const result = evaluateExpression("2147483647 + 0.5");
    expect(result).toBe(2147483647.5);
  });

  it("handles compound assignment with float operand", () => {
    const env: any = { i: 1 };
    const runtime = {
      enums: {},
      classes: {},
      functions: {},
      variables: { i: { type: "int", dimensions: [] } },
      properties: {},
      staticLocals: {},
      globalValues: {},
    } as RuntimeState;
    evaluateExpression("i += 2.5", env, runtime);
    expect(env.i).toBe(3);
  });

  it("supports datetime arithmetic without overflow", () => {
    const env: any = { t: new DateTimeValue(2147483647) };
    const runtime = {
      enums: {},
      classes: {},
      functions: {},
      variables: { t: { type: "datetime", dimensions: [] } },
      properties: {},
      staticLocals: {},
      globalValues: {},
    } as RuntimeState;
    evaluateExpression("t += 1", env, runtime);
    expect(env.t.valueOf()).toBe(2147483648);
  });
});

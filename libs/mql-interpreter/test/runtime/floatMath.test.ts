import { evaluateExpression } from "../../src/runtime/expression";
import { describe, it, expect } from "vitest";
import type { RuntimeState } from "../../src/runtime/types";

describe("float math", () => {
  it("performs float addition with 32-bit precision", () => {
    const env: any = { a: Math.fround(0.1), b: Math.fround(0.2) };
    const runtime = {
      enums: {},
      classes: {},
      functions: {},
      variables: {
        a: { type: "float", dimensions: [] },
        b: { type: "float", dimensions: [] },
      },
      properties: {},
      staticLocals: {},
      globalValues: {},
    } as RuntimeState;
    const result = evaluateExpression("a + b", env, runtime);
    expect(result).toBe(Math.fround(Math.fround(0.1) + Math.fround(0.2)));
  });

  it("increments float variables with rounding", () => {
    const env: any = { a: Math.fround(0.5) };
    const runtime = {
      enums: {},
      classes: {},
      functions: {},
      variables: {
        a: { type: "float", dimensions: [] },
      },
      properties: {},
      staticLocals: {},
      globalValues: {},
    } as RuntimeState;
    evaluateExpression("a++", env, runtime);
    expect(env.a).toBe(Math.fround(Math.fround(0.5) + 1));
  });
});

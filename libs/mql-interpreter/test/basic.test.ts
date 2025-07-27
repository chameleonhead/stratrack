import { interpret, compile } from "../src";
import { describe, it, expect } from "vitest";

describe("interpret", () => {
  it("runs without throwing", () => {
    expect(() => interpret("")).not.toThrow();
  });

  it("returns properties from interpret", () => {
    const result = interpret('#property copyright "test"');
    expect(result.properties).toEqual({ copyright: ['"test"'] });
  });

  it("stores execution context when provided", () => {
    const ctx = { entryPoint: "Print", args: ["hi"] };
    const runtime = interpret("", ctx);
    expect(runtime.context).toEqual(expect.objectContaining(ctx));
  });

  it("compiles without executing", () => {
    const { runtime } = compile("input int A=1;");
    expect(runtime.variables.A.storage).toBe("input");
    expect(runtime.globalValues.A).toBe(1);
  });
});

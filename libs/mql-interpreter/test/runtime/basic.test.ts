import { runProgram, buildProgram } from "../helpers";
import { describe, it, expect } from "vitest";

describe("runtime", () => {
  it("runs without throwing", () => {
    expect(() => runProgram("")).not.toThrow();
  });

  it("returns properties from execution", () => {
    const result = runProgram('#property copyright "test"');
    expect(result.properties).toEqual({ copyright: ['"test"'] });
  });

  it("stores execution context when provided", () => {
    const ctx = { entryPoint: "Print", args: ["hi"] };
    const runtime = runProgram("", ctx);
    expect(runtime.context).toEqual(expect.objectContaining(ctx));
  });

  it("builds without executing", () => {
    const { runtime } = buildProgram("input int A=1;");
    expect(runtime.variables.A.storage).toBe("input");
    expect(runtime.globalValues.A).toBe(1);
  });
});

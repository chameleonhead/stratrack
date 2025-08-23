import { runProgram, buildProgram } from "../helpers";
import { registerEnvBuiltins } from "../../src/libs/functions";
import { createCommon } from "../../src/libs/functions/common";
import type { ExecutionContext } from "../../src/libs/functions/types";
import { describe, it, expect, beforeEach } from "vitest";

describe("runtime", () => {
  beforeEach(() => {
    // Register Print function for tests that need it
    const context: ExecutionContext = {
      terminal: null,
      broker: null,
      account: null,
      market: null,
      symbol: "TEST",
      timeframe: 60,
      indicators: null,
    };
    const commonFuncs = createCommon(context);
    registerEnvBuiltins(commonFuncs);
  });
  
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

import { getBuiltin, registerEnvBuiltins } from "../../src/libs/functions";
import { createCommon } from "../../src/libs/functions/common";
import type { ExecutionContext } from "../../src/libs/functions/types";
import { describe, it, expect, beforeEach } from "vitest";

describe("builtins", () => {
  beforeEach(() => {
    // Register necessary functions for tests
    const context: ExecutionContext = {
      terminal: null,
      broker: null,
      account: null,
      market: null,
      symbol: "TEST",
      timeframe: 60,
      indicatorEngine: null,
    };
    const commonFuncs = createCommon(context);
    // Add a dummy AccountBalance function
    registerEnvBuiltins({
      ...commonFuncs,
      AccountBalance: () => 10000,
    });
  });

  it("provides Print function", () => {
    const fn = getBuiltin("Print");
    expect(fn).toBeTypeOf("function");
  });

  it("provides an account information function", () => {
    const fn = getBuiltin("AccountBalance");
    expect(fn).toBeTypeOf("function");
  });

  it("implements math and string helpers", () => {
    expect(getBuiltin("MathPow")?.(2, 3)).toBe(8);
    expect(getBuiltin("StringLen")?.("abc")).toBe(3);
    expect(getBuiltin("PlaySound")?.("x")).toBe(true);
  });

  it("allows overriding environment builtins", () => {
    registerEnvBuiltins({ iMA: () => 42 });
    const fn = getBuiltin("iMA");
    expect(fn?.()).toBe(42);
  });

  it("returns undefined for unknown", () => {
    expect(getBuiltin("Unknown")).toBeUndefined();
  });
});

import { getBuiltin, registerEnvBuiltins } from "../../src/libs/common";
import { describe, it, expect } from "vitest";

describe("builtins", () => {
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

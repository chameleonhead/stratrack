import { describe, it, expect } from "vitest";
import { coreBuiltins, envBuiltins } from "../../src/core/runtime/builtins/impl/index";
import { builtinSignatures } from "../../src/core/parser/builtins/signatures";

describe("builtin signatures", () => {
  it("covers all registered builtins", () => {
    const names = new Set([...Object.keys(coreBuiltins), ...Object.keys(envBuiltins)]);
    const missing = [...names].filter((n) => !(n in builtinSignatures));
    expect(missing).toEqual([]);
  });
});

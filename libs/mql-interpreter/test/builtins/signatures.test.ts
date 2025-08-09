import { describe, it, expect } from "vitest";
import { coreBuiltins, envBuiltins } from "../../src/builtins/impl/index.js";
import { builtinSignatures } from "../../src/builtins/signatures.js";

describe("builtin signatures", () => {
  it("covers all registered builtins", () => {
    const names = new Set([...Object.keys(coreBuiltins), ...Object.keys(envBuiltins)]);
    const missing = [...names].filter((n) => !(n in builtinSignatures));
    expect(missing).toEqual([]);
  });
});

import { describe, it, expect } from "vitest";
import { coreBuiltins } from "../../../src/libs/functions/registry";
import { builtinSignatures } from "../../../src/libs/signatures";

describe("builtin signatures", () => {
  it("covers all registered builtins", () => {
    const names = new Set([...Object.keys(coreBuiltins)]);
    const missing = [...names].filter((n) => !(n in builtinSignatures));
    expect(missing).toEqual([]);
  });
});

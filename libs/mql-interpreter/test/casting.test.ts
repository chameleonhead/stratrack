import { cast } from "../src/casting";
import { describe, it, expect } from "vitest";

describe("cast", () => {
  it("casts to int by truncating", () => {
    expect(cast(5.8, "int")).toBe(5);
  });

  it("casts to double", () => {
    expect(cast("3.14", "double")).toBeCloseTo(3.14);
  });

  it("casts to string", () => {
    expect(cast(10, "string")).toBe("10");
  });

  it("casts to bool", () => {
    expect(cast(0, "bool")).toBe(0);
    expect(cast(5, "bool")).toBe(1);
  });

  it("throws on unknown type", () => {
    // Force cast with incorrect type
    expect(() => cast(1, "unknown" as any)).toThrow("Unknown cast target");
  });
});

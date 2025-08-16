import { describe, expect, it } from "vitest";
import { interpret } from "../src";

describe("interpret", () => {
  it("returns interpreted string", () => {
    expect(interpret("foo")).toBe("interpreted: foo");
  });
});

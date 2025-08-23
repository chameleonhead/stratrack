import { buildProgram } from "../helpers";
import { describe, it, expect } from "vitest";

describe("builtin functions", () => {
  it("supports printf, Comment, and NormalizeDouble", () => {
    const source = `
      void OnStart() {
        printf("error %d", 1);
        Comment("value", 1);
        double Zg = NormalizeDouble(1.23456, 5);
      }
    `;
    const result = buildProgram(source);
    expect(result.errors).toEqual([]);
  });
});

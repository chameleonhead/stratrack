import { describe, it, expect } from "vitest";
import { buildProgram } from "../helpers";

describe("program type detection", () => {
  it("detects expert advisors via OnTick", () => {
    const { programType } = buildProgram("void OnTick(){}");
    expect(programType).toBe("expert");
  });

  it("detects scripts via OnStart", () => {
    const { programType } = buildProgram("void OnStart(){}");
    expect(programType).toBe("script");
  });

  it("detects indicators via OnCalculate", () => {
    const { programType } = buildProgram("int OnCalculate(){return 0;}");
    expect(programType).toBe("indicator");
  });
});

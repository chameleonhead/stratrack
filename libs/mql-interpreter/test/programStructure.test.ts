import { describe, it, expect } from "vitest";
import { compile } from "../src/index";

describe("program type detection", () => {
  it("detects expert advisors via OnTick", () => {
    const { programType } = compile("void OnTick(){}");
    expect(programType).toBe("expert");
  });

  it("detects scripts via OnStart", () => {
    const { programType } = compile("void OnStart(){}");
    expect(programType).toBe("script");
  });

  it("detects indicators via OnCalculate", () => {
    const { programType } = compile("int OnCalculate(){return 0;}");
    expect(programType).toBe("indicator");
  });
});

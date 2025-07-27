import {
  MathAbs,
  MathCeil,
  MathCos,
  MathExp,
  MathFloor,
  MathLog,
  MathLog10,
  MathMax,
  MathMin,
  MathMod,
  MathPow,
  MathRand,
  MathRound,
  MathSin,
  MathSqrt,
  MathSrand,
  MathTan,
  MathIsValidNumber,
} from "../../src/builtins/impl/math";
import { describe, it, expect } from "vitest";

describe("math builtins", () => {
  it("MathAbs returns absolute value", () => {
    expect(MathAbs(-5)).toBe(5);
  });

  it("MathPow computes exponentiation", () => {
    expect(MathPow(2, 3)).toBe(8);
  });

  it("MathSqrt computes square root", () => {
    expect(MathSqrt(9)).toBe(3);
  });

  it("trigonometric and exponential functions work", () => {
    expect(MathCos(0)).toBeCloseTo(1);
    expect(MathSin(0)).toBeCloseTo(0);
    expect(MathTan(0)).toBeCloseTo(0);
    expect(MathExp(0)).toBeCloseTo(1);
  });

  it("logarithmic and rounding functions work", () => {
    expect(MathLog(Math.E)).toBeCloseTo(1);
    expect(MathLog10(100)).toBeCloseTo(2);
    expect(MathFloor(1.9)).toBe(1);
    expect(MathCeil(1.2)).toBe(2);
    expect(MathRound(1.6)).toBe(2);
  });

  it("MathMax Min and Mod work", () => {
    expect(MathMax(3, 7)).toBe(7);
    expect(MathMin(3, 7)).toBe(3);
    expect(MathMod(7, 3)).toBe(1);
  });

  it("MathRand and MathSrand produce deterministic values", () => {
    MathSrand(1);
    expect(MathRand()).toBe(41);
  });

  it("MathIsValidNumber detects NaN", () => {
    expect(MathIsValidNumber(5)).toBe(1);
    expect(MathIsValidNumber(NaN)).toBe(0);
  });
});

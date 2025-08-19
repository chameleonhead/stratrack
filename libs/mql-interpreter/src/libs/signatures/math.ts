import { BuiltinSignaturesMap } from "./types";

// https://docs.mql4.com/math
export const mathBuiltinSignatures: BuiltinSignaturesMap = {
  acos: {
    args: [{ name: "x", type: "double" }],
    returnType: "double",
    description: "Returns the arc cosine of x in radians",
  },
  asin: {
    args: [{ name: "x", type: "double" }],
    returnType: "double",
    description: "Returns the arc sine of x in radians",
  },
  atan: {
    args: [{ name: "x", type: "double" }],
    returnType: "double",
    description: "Returns the arc tangent of x in radians",
  },
  ceil: {
    args: [{ name: "x", type: "double" }],
    returnType: "double",
    description: "Returns integer numeric value closest from above",
  },
  cos: {
    args: [{ name: "x", type: "double" }],
    returnType: "double",
    description: "Returns the cosine of a number",
  },
  exp: {
    args: [{ name: "x", type: "double" }],
    returnType: "double",
    description: "Returns exponent of a number",
  },
  fabs: {
    args: [{ name: "x", type: "double" }],
    returnType: "double",
    description: "Returns absolute value (modulus) of the specified numeric value",
  },
  floor: {
    args: [{ name: "x", type: "double" }],
    returnType: "double",
    description: "Returns integer numeric value closest from below",
  },
  fmax: {
    args: [
      { name: "x", type: "double" },
      { name: "y", type: "double" },
    ],
    returnType: "double",
    description: "Returns the maximal value of the two numeric values",
  },
  fmin: {
    args: [
      { name: "x", type: "double" },
      { name: "y", type: "double" },
    ],
    returnType: "double",
    description: "Returns the minimal value of the two numeric values",
  },
  fmod: {
    args: [
      { name: "x", type: "double" },
      { name: "y", type: "double" },
    ],
    returnType: "double",
    description: "Returns the real remainder after the division of two numbers",
  },
  log: {
    args: [{ name: "x", type: "double" }],
    returnType: "double",
    description: "Returns natural logarithm",
  },
  log10: {
    args: [{ name: "x", type: "double" }],
    returnType: "double",
    description: "Returns the logarithm of a number by base 10",
  },
  MathAbs: {
    args: [{ name: "value", type: "double" }],
    returnType: "double",
    description: "Returns absolute value (modulus) of the specified numeric value",
  },
  MathArccos: {
    args: [{ name: "value", type: "double" }],
    returnType: "double",
    description: "Returns the arc cosine of x in radians",
  },
  MathArcsin: {
    args: [{ name: "value", type: "double" }],
    returnType: "double",
    description: "Returns the arc sine of x in radians",
  },
  MathArctan: {
    args: [{ name: "value", type: "double" }],
    returnType: "double",
    description: "Returns the arc tangent of x in radians",
  },
  MathCeil: {
    args: [{ name: "value", type: "double" }],
    returnType: "double",
    description: "Returns integer numeric value closest from above",
  },
  MathCos: {
    args: [{ name: "value", type: "double" }],
    returnType: "double",
    description: "Returns the cosine of a number",
  },
  MathExp: {
    args: [{ name: "value", type: "double" }],
    returnType: "double",
    description: "Returns exponent of a number",
  },
  MathFloor: {
    args: [{ name: "value", type: "double" }],
    returnType: "double",
    description: "Returns integer numeric value closest from below",
  },
  MathIsValidNumber: {
    args: [{ name: "value", type: "double" }],
    returnType: "bool",
    description: "Checks the correctness of a real number",
  },
  MathLog: {
    args: [{ name: "value", type: "double" }],
    returnType: "double",
    description: "Returns natural logarithm",
  },
  MathLog10: {
    args: [{ name: "value", type: "double" }],
    returnType: "double",
    description: "Returns the logarithm of a number by base 10",
  },
  MathMax: {
    args: [
      { name: "value1", type: "double" },
      { name: "value2", type: "double" },
    ],
    returnType: "double",
    description: "Returns the maximal value of the two numeric values",
  },
  MathMin: {
    args: [
      { name: "value1", type: "double" },
      { name: "value2", type: "double" },
    ],
    returnType: "double",
    description: "Returns the minimal value of the two numeric values",
  },
  MathMod: {
    args: [
      { name: "value1", type: "double" },
      { name: "value2", type: "double" },
    ],
    returnType: "double",
    description: "Returns the real remainder after the division of two numbers",
  },
  MathPow: {
    args: [
      { name: "base", type: "double" },
      { name: "exponent", type: "double" },
    ],
    returnType: "double",
    description: "Raises the base to the specified power",
  },
  MathRand: {
    args: [],
    returnType: "double",
    description: "Returns a pseudorandom value within the range of 0 to 32767",
  },
  MathRound: {
    args: [{ name: "value", type: "double" }],
    returnType: "double",
    description: "Rounds of a value to the nearest integer",
  },
  MathSin: {
    args: [{ name: "value", type: "double" }],
    returnType: "double",
    description: "Returns the sine of a number",
  },
  MathSqrt: {
    args: [{ name: "value", type: "double" }],
    returnType: "double",
    description: "Returns a square root",
  },
  MathSrand: {
    args: [{ name: "seed", type: "int" }],
    returnType: "void",
    description: "Sets the starting point for generating a series of pseudorandom integers",
  },
  MathTan: {
    args: [{ name: "value", type: "double" }],
    returnType: "double",
    description: "Returns the tangent of a number",
  },
  pow: {
    args: [
      { name: "base", type: "double" },
      { name: "exponent", type: "double" },
    ],
    returnType: "double",
    description: "Raises the base to the specified power",
  },
  rand: {
    args: [],
    returnType: "double",
    description: "Returns a pseudorandom value within the range of 0 to 32767",
  },
  round: {
    args: [{ name: "value", type: "double" }],
    returnType: "double",
    description: "Rounds of a value to the nearest integer",
  },
  sin: {
    args: [{ name: "x", type: "double" }],
    returnType: "double",
    description: "Returns the sine of a number",
  },
  sqrt: {
    args: [{ name: "x", type: "double" }],
    returnType: "double",
    description: "Returns a square root",
  },
  srand: {
    args: [{ name: "seed", type: "int" }],
    returnType: "void",
    description: "Sets the starting point for generating a series of pseudorandom integers",
  },
  tan: {
    args: [{ name: "x", type: "double" }],
    returnType: "double",
    description: "Returns the tangent of a number",
  },
};

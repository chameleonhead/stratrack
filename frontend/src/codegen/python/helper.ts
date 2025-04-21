// ------------------------------------
// Expression helpers
// ------------------------------------

import {
  PyLiteral,
  PyVariable,
  PyExpression,
  PyAttribute,
  PyCall,
  PySubscript,
  PyCompare,
  PyUnaryOp,
  PyList,
  PyDict,
  PyAssignment,
  PyStatement,
  PyIf,
  PyReturn,
  PyExprStatement,
  PyComment,
  PyPass,
  PyBreak,
  PyContinue,
  PyFor,
  PyWhile,
  PyFunction,
  PyClass,
  PyModule,
  PyTernaryOp,
  PyImport,
  PyTuple,
} from "./ast";

export const lit = (value: string | number | boolean | null): PyLiteral => ({
  type: "literal",
  value,
});

export const ref = (name: string): PyVariable => ({
  type: "variable",
  name,
});

export const attr = (obj: PyExpression, attr: string): PyAttribute => ({
  type: "attribute",
  object: obj,
  attr,
});

export const call = (fn: PyExpression, args: PyExpression[] = []): PyCall => ({
  type: "call",
  function: fn,
  args,
});

export const sub = (value: PyExpression, index: PyExpression): PySubscript => ({
  type: "subscript",
  value,
  index,
});

export const cmp = (
  left: PyExpression,
  operators: string[],
  comparators: PyExpression[]
): PyCompare => ({
  type: "compare",
  left,
  operators,
  comparators,
});

export const unary = (operator: string, operand: PyExpression): PyUnaryOp => ({
  type: "unary",
  operator,
  operand,
});

export const bin = (operator: string, left: PyExpression, right: PyExpression): PyExpression => {
  if ((operator === "+" || operator === "-") && (isZeroLiteral(left) || isZeroLiteral(right))) {
    if (isZeroLiteral(left)) {
      return operator === "+" ? right : unary("-", right);
    }
    if (isZeroLiteral(right)) {
      return left;
    }
  }
  return {
    type: "binary",
    operator,
    left,
    right,
  };
};

export const ternary = (
  condition: PyExpression,
  trueExpr: PyExpression,
  falseExpr: PyExpression
): PyTernaryOp => ({
  type: "ternary",
  condition,
  trueExpr,
  falseExpr,
});

const isZeroLiteral = (expr: PyExpression): boolean =>
  expr.type === "literal" && (expr.value === 0 || expr.value === 0.0);

export const list = (elements: PyExpression[]): PyList => ({
  type: "list",
  elements,
});

export const tuple = (elements: PyExpression[]): PyTuple => ({
  type: "tuple",
  elements,
});

export const dict = (entries: { key: PyExpression; value: PyExpression }[]): PyDict => ({
  type: "dict",
  entries,
});

// ------------------------------------
// Statement helpers
// ------------------------------------

export const assign = (target: PyExpression, value: PyExpression): PyAssignment => ({
  type: "assign",
  target,
  value,
});

export const iff = (
  condition: PyExpression,
  thenBody: PyStatement[],
  elseBody?: PyStatement[]
): PyIf => ({
  type: "if",
  condition,
  thenBody,
  elseBody,
});

export const ret = (value?: PyExpression): PyReturn => ({
  type: "return",
  value,
});

export const stmt = (expression: PyExpression): PyExprStatement => ({
  type: "expr_stmt",
  expression,
});

export const comment = (text: string): PyComment => ({
  type: "comment",
  text,
});

export const passStmt = (): PyPass => ({
  type: "pass",
});

export const breakStmt = (): PyBreak => ({
  type: "break",
});

export const continueStmt = (): PyContinue => ({
  type: "continue",
});

export const forStmt = (variable: string, iterable: PyExpression, body: PyStatement[]): PyFor => ({
  type: "for",
  variable,
  iterable,
  body,
});

export const whileStmt = (condition: PyExpression, body: PyStatement[]): PyWhile => ({
  type: "while",
  condition,
  body,
});

// ------------------------------------
// Function helper
// ------------------------------------

export const func = (name: string, args: string[], body: PyStatement[]): PyFunction => ({
  type: "function",
  name,
  args,
  body,
});

export const imp = (name: string, from?: string): PyImport => ({
  type: "import",
  name,
  from,
});

// ------------------------------------
// Class helper
// ------------------------------------

export const cls = (
  name: string,
  fields: PyAssignment[],
  methods: PyFunction[],
  baseClasses: string[] = []
): PyClass => ({
  type: "class",
  name,
  baseClasses,
  fields,
  methods,
});

// ------------------------------------
// Module helper
// ------------------------------------

export const mod = (
  globals: (PyClass | PyFunction)[],
  imports: PyImport[] = [],
  main?: PyStatement[]
): PyModule => ({
  type: "module",
  classes: globals.filter((cls) => cls.type === "class"),
  functions: globals.filter((fn) => fn.type === "function"),
  main,
  imports,
});

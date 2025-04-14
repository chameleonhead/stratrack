import {
  MqlLiteral,
  MqlVariableRef,
  MqlExpression,
  MqlBinaryExpr,
  MqlUnaryExpr,
  MqlTernaryExpr,
  MqlFunctionCallExpr,
  MqlExprStatement,
  MqlDecl,
  MqlReturn,
  MqlStatement,
  MqlIf,
  MqlFor,
  MqlComment,
  MqlFunctionCall,
  MqlArgument,
  MqlFunction,
  MqlGlobalVariable,
  MqlIndexBuffer,
  MqlFile,
} from "./mqlast";

export const lit = (value: string | number): MqlLiteral => new MqlLiteral(value?.toString());
export const ref = (name: string): MqlVariableRef => new MqlVariableRef(name);
export const bin = (left: MqlExpression, op: string, right: MqlExpression): MqlBinaryExpr =>
  new MqlBinaryExpr(left, op, right);
export const unary = (op: string, expr: MqlExpression): MqlUnaryExpr => new MqlUnaryExpr(op, expr);
export const ternary = (
  cond: MqlExpression,
  thenExpr: MqlExpression,
  elseExpr: MqlExpression
): MqlTernaryExpr => new MqlTernaryExpr(cond, thenExpr, elseExpr);
export const call = (
  name: string,
  args: (MqlExpression | string | number)[]
): MqlFunctionCallExpr =>
  new MqlFunctionCallExpr(
    name,
    args.map((a) => (typeof a === "string" || typeof a === "number" ? lit(a) : a))
  );

export const stmt = (expr: MqlExpression): MqlExprStatement => new MqlExprStatement(expr);
export const decl = (name: string, type: string, init?: MqlExpression): MqlDecl =>
  new MqlDecl(name, type, init);
export const ret = (expr?: MqlExpression): MqlReturn => new MqlReturn(expr);
export const iff = (
  cond: MqlExpression,
  thenStmts: MqlStatement[],
  elseStmts?: MqlStatement[]
): MqlIf => new MqlIf(cond, thenStmts, elseStmts);
export const loop = (
  init: MqlStatement,
  cond: MqlExpression,
  inc: MqlStatement,
  body: MqlStatement[]
): MqlFor => new MqlFor(init, cond, inc, body);
export const comment = (text: string): MqlComment => new MqlComment(text);
export const callStmt = (name: string, args: string[]): MqlFunctionCall =>
  new MqlFunctionCall(name, args);

export const fn = (
  name: string,
  returnType: string,
  body: MqlStatement[],
  args: MqlArgument[] = []
): MqlFunction => new MqlFunction(name, returnType, body, args);

export const arg = (name: string, type: string): MqlArgument => new MqlArgument(name, type);

export const globalVar = (name: string, type: string, init?: string): MqlGlobalVariable =>
  new MqlGlobalVariable(name, type, init);

export const file = (
  type: "expert" | "indicator",
  vars: MqlGlobalVariable[],
  funcs: MqlFunction[],
  props: string[] = [],
  buffers: MqlIndexBuffer[] = []
): MqlFile => new MqlFile(type, vars, funcs, props, buffers);

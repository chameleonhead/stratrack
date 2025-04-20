import {
  MqlArrayAccessExpr,
  MqlAssignStmt,
  MqlCallExpr,
  MqlClass,
  MqlClassField,
  MqlClassMethod,
  MqlCommentStmt,
  MqlCondExpr,
  MqlConstructor,
  MqlDeclaration,
  MqlDeclStmt,
  MqlDestructor,
  MqlExpr,
  MqlExprStmt,
  MqlForStmt,
  MqlFunction,
  MqlIfStmt,
  MqlLiteralExpr,
  MqlMemberAccessExpr,
  MqlMethodCallExpr,
  MqlProgram,
  MqlReturnStmt,
  MqlStatement,
  MqlTernaryExpr,
  MqlUnaryExpr,
  MqlVarRefExpr,
} from "./ast";

export const lit = (value: string | number): MqlLiteralExpr => ({
  type: "literal",
  value: value.toString(),
});

export const strlit = (value: string): MqlLiteralExpr => ({
  type: "literal",
  value: `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`,
});

export const ref = (name: string): MqlVarRefExpr => ({
  type: "var_ref",
  name,
});

export const access = (
  array: MqlExpr,
  index: MqlExpr,
  safe: boolean = true,
  fallback?: MqlExpr
): MqlArrayAccessExpr => ({
  type: "array_access",
  array,
  index,
  safe: index.type === "literal" && index.value === "0" ? true : safe,
  fallback,
});

export const unary = (operator: string, value: MqlExpr, before: boolean = true): MqlUnaryExpr => ({
  type: "unary",
  operator,
  value,
  before,
});

export const binary = (operator: string, left: MqlExpr, right: MqlExpr): MqlExpr =>
  left.type === "literal" && left.value === "0" && (operator === "+" || operator === "-")
    ? operator === "+"
      ? right
      : unary("-", right)
    : right.type === "literal" && right.value === "0" && (operator === "+" || operator === "-")
      ? left
      : {
          type: "binary",
          operator,
          left,
          right,
        };

export const or = (...conditions: MqlExpr[]): MqlCondExpr => ({
  type: "cond",
  operator: "||",
  conditions,
});

export const and = (...conditions: MqlExpr[]): MqlCondExpr => ({
  type: "cond",
  operator: "&&",
  conditions,
});

export const ternary = (
  condition: MqlExpr,
  trueExpr: MqlExpr,
  falseExpr: MqlExpr
): MqlTernaryExpr => ({
  type: "ternary",
  condition,
  trueExpr,
  falseExpr,
});

export const call = (name: string, args: MqlExpr[] = []): MqlCallExpr => ({
  type: "call",
  name,
  args,
});

export const member = (object: MqlExpr, member: string): MqlMemberAccessExpr => ({
  type: "member_access",
  object,
  member,
});

export const methodCall = (
  object: MqlExpr,
  method: string,
  args: MqlExpr[] = []
): MqlMethodCallExpr => ({
  type: "method_call",
  object,
  method,
  args,
});

export const ea = (
  classes: MqlClass[],
  properties: string[],
  declarations: MqlDeclaration[],
  functions: MqlFunction[]
): MqlProgram => ({
  type: "program",
  kind: "expert",
  buffers: [],
  classes,
  properties,
  declarations,
  functions,
});

export const decl = (name: string, varType: string, init?: MqlExpr): MqlDeclaration => ({
  type: "declaration",
  name,
  varType,
  init,
});

export const fn = (
  name: string,
  returnType: string,
  args: { name: string; type: string }[],
  body: MqlStatement[]
): MqlFunction => ({
  type: "function",
  name,
  returnType,
  args,
  body,
});

export const arg = (name: string, type: string): { name: string; type: string } => ({
  name,
  type,
});

export const stmt = (expr: MqlExpr): MqlExprStmt => ({
  type: "expr_stmt",
  expr,
});

export const declStmt = (name: string, varType: string, init?: MqlExpr): MqlDeclStmt => ({
  type: "decl_stmt",
  decl: decl(name, varType, init),
});

export const callStmt = (name: string, args: MqlExpr[] = []): MqlStatement =>
  stmt(call(name, args));

export const assignStmt = (
  variable: MqlVarRefExpr | MqlArrayAccessExpr | MqlMemberAccessExpr,
  value: MqlExpr
): MqlAssignStmt => ({
  type: "assign_stmt",
  variable,
  value,
});

export const ret = (expr?: MqlExpr): MqlReturnStmt => ({
  type: "return",
  expr,
});

export const iff = (
  condition: MqlExpr,
  thenBranch: MqlStatement[],
  elseBranch?: MqlStatement[]
): MqlIfStmt => ({
  type: "if",
  condition,
  thenBranch,
  elseBranch,
});

export const loop = (
  init: MqlStatement,
  condition: MqlExpr,
  increment: MqlStatement,
  body: MqlStatement[]
): MqlForStmt => ({
  type: "for",
  init,
  condition,
  increment,
  body,
});

export const comment = (text: string): MqlCommentStmt => ({
  type: "comment",
  text,
});

export const classDecl = (
  name: string,
  fields: MqlClassField[],
  methods: MqlClassMethod[],
  ctor?: MqlConstructor,
  dtor?: MqlDestructor
): MqlClass => ({
  type: "class",
  name,
  fields,
  methods,
  ctor,
  dtor,
});

export const field = (
  name: string,
  varType: string,
  access: "public" | "private"
): MqlClassField => ({
  type: "field",
  name,
  varType,
  access,
});

export const method = (
  name: string,
  returnType: string,
  body: MqlStatement[],
  args: { name: string; type: string }[] = [],
  access: "public" | "private" = "public"
): MqlClassMethod => ({
  type: "method",
  name,
  returnType,
  args,
  body,
  access,
});

export const ctor = (
  body: MqlStatement[],
  args: { name: string; type: string }[] = [],
  access: "public" | "private" = "public"
): MqlConstructor => ({
  type: "constructor",
  args,
  body,
  access,
});

export const dtor = (
  body: MqlStatement[],
  args: { name: string; type: string }[] = [],
  access: "public" | "private" = "public"
): MqlDestructor => ({
  type: "destructor",
  args,
  body,
  access,
});

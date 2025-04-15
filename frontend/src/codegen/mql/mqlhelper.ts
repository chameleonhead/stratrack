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
  MqlConstructor,
  MqlClass,
  MqlClassField,
  MqlClassMethod,
  MqlDestructor,
  MqlGlobalItem,
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
export const callStmt = (name: string, args: MqlExpression[]): MqlFunctionCall =>
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
  globals: MqlGlobalItem[],
  props: string[] = [],
  buffers: MqlIndexBuffer[] = []
): MqlFile => new MqlFile(type, globals, props, buffers);

/** クラスフィールド（変数）の生成 */
export const field = (
  name: string,
  type: string,
  access: "public" | "private" = "private"
): MqlClassField => new MqlClassField(name, type, access);

/** クラスメソッドの生成 */
export const method = (
  name: string,
  returnType: string,
  body: MqlStatement[],
  args: MqlArgument[] = [],
  access: "public" | "private" = "public"
): MqlClassMethod => new MqlClassMethod(name, returnType, body, args, access);

/** コンストラクタの生成 */
export const ctor = (
  className: string,
  body: MqlStatement[],
  args: MqlArgument[] = []
): MqlConstructor => new MqlConstructor(className, body, args);

/** デストラクタの生成 */
export const dtor = (className: string, body: MqlStatement[]): MqlDestructor =>
  new MqlDestructor(className, body);

/** クラスの生成 */
export const cls = (
  name: string,
  fields: MqlClassField[],
  methods: (MqlClassMethod | MqlConstructor | MqlDestructor)[]
): MqlClass => new MqlClass(name, fields, methods);

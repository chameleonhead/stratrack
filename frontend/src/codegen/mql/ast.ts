export type MqlProgram = {
  classes?: MqlClass[];
  type: "program";
  kind: "expert" | "indicator";
  properties: string[];
  buffers: MqlBuffer[];
  declarations: MqlDeclaration[];
  functions: MqlFunction[];
};

export type MqlBuffer = {
  name: string;
  index: number;
  style?: string;
  label?: string;
};

export type MqlDeclaration = {
  type: "declaration";
  name: string;
  varType: string;
  init?: MqlExpr;
};

export type MqlFunction = {
  type: "function";
  name: string;
  returnType: string;
  args: { name: string; type: string }[];
  body: MqlStatement[];
};

// -----------------------------
// Statement types
// -----------------------------

export type MqlStatement =
  | MqlDeclStmt
  | MqlAssignStmt
  | MqlExprStmt
  | MqlReturnStmt
  | MqlIfStmt
  | MqlForStmt
  | MqlCommentStmt;

export type MqlDeclStmt = {
  type: "decl_stmt";
  decl: MqlDeclaration;
};

export type MqlAssignStmt = {
  type: "assign_stmt";
  variable: MqlVarRefExpr | MqlArrayAccessExpr | MqlMemberAccessExpr;
  value: MqlExpr;
};

export type MqlExprStmt = {
  type: "expr_stmt";
  expr: MqlExpr;
};

export type MqlReturnStmt = {
  type: "return";
  expr?: MqlExpr;
};

export type MqlIfStmt = {
  type: "if";
  condition: MqlExpr;
  thenBranch: MqlStatement[];
  elseBranch?: MqlStatement[];
};

export type MqlForStmt = {
  type: "for";
  init: MqlStatement;
  condition: MqlExpr;
  increment: MqlStatement;
  body: MqlStatement[];
};

export type MqlCommentStmt = {
  type: "comment";
  text: string;
};

// -----------------------------
// Class types

export type MqlClass = {
  type: "class";
  name: string;
  fields: MqlClassField[];
  methods: MqlClassMethod[];
  ctor?: MqlConstructor;
  dtor?: MqlDestructor;
};

export type MqlClassField = {
  type: "field";
  name: string;
  varType: string;
  access: "public" | "private";
};

export type MqlClassMethod = {
  type: "method";
  name: string;
  returnType: string;
  args: { name: string; type: string }[];
  body: MqlStatement[];
  access: "public" | "private";
};

export type MqlConstructor = {
  type: "constructor";
  args: { name: string; type: string }[];
  body: MqlStatement[];
  access: "public" | "private";
};

export type MqlDestructor = {
  type: "destructor";
  args: { name: string; type: string }[];
  body: MqlStatement[];
  access: "public" | "private";
};

// -----------------------------
// Expression types

export type MqlMemberAccessExpr = {
  type: "member_access";
  object: MqlExpr;
  member: string;
};

export type MqlMethodCallExpr = {
  type: "method_call";
  object: MqlExpr;
  method: string;
  args: MqlExpr[];
};

export type MqlArrayAccessExpr = {
  type: "array_access";
  array: MqlExpr;
  index: MqlExpr;
  safe: boolean; // trueなら "index >= Bars ? fallback : array[index]" に展開
  fallback?: MqlExpr;
};
// -----------------------------

export type MqlExpr =
  | MqlMemberAccessExpr
  | MqlMethodCallExpr
  | MqlArrayAccessExpr
  | MqlLiteralExpr
  | MqlVarRefExpr
  | MqlUnaryExpr
  | MqlBinaryExpr
  | MqlTernaryExpr
  | MqlCondExpr
  | MqlCallExpr;

export type MqlLiteralExpr = {
  type: "literal";
  value: string;
};

export type MqlVarRefExpr = {
  type: "var_ref";
  name: string;
};

export type MqlUnaryExpr = {
  type: "unary";
  operator: string;
  value: MqlExpr;
  before?: boolean; // trueなら "operator value"、falseなら "value operator"
};

export type MqlBinaryExpr = {
  type: "binary";
  operator: string;
  left: MqlExpr;
  right: MqlExpr;
};

export type MqlTernaryExpr = {
  type: "ternary";
  condition: MqlExpr;
  trueExpr: MqlExpr;
  falseExpr: MqlExpr;
};

export type MqlCondExpr = {
  type: "cond";
  operator: "&&" | "||";
  conditions: MqlExpr[];
};

export type MqlCallExpr = {
  type: "call";
  name: string;
  args: MqlExpr[];
};

// モジュール（ファイル）
export type PyModule = {
  type: "module";
  imports?: string[];
  classes: PyClass[];
};

// クラス定義
export type PyClass = {
  type: "class";
  name: string;
  baseClasses?: string[];
  methods: PyFunction[];
};

// 関数（メソッド）定義
export type PyFunction = {
  type: "function";
  name: string;
  args: string[];
  body: PyStatement[];
};

// ============================
// ステートメント定義
// ============================

export type PyStatement =
  | PyAssignment
  | PyIf
  | PyExprStatement
  | PyReturn
  | PyFor
  | PyWhile
  | PyBreak
  | PyContinue
  | PyPass
  | PyComment;

// 代入文
export type PyAssignment = {
  type: "assign";
  target: PyExpression;
  value: PyExpression;
};

// if 文
export type PyIf = {
  type: "if";
  condition: PyExpression;
  thenBody: PyStatement[];
  elseBody?: PyStatement[];
};

// 単一の式を文として実行
export type PyExprStatement = {
  type: "expr_stmt";
  expression: PyExpression;
};

// return 文
export type PyReturn = {
  type: "return";
  value?: PyExpression;
};

// for 文
export type PyFor = {
  type: "for";
  variable: string;
  iterable: PyExpression;
  body: PyStatement[];
};

// while 文
export type PyWhile = {
  type: "while";
  condition: PyExpression;
  body: PyStatement[];
};

// break 文
export type PyBreak = {
  type: "break";
};

// continue 文
export type PyContinue = {
  type: "continue";
};

// pass 文
export type PyPass = {
  type: "pass";
};

// コメント（出力時に # を付ける）
export type PyComment = {
  type: "comment";
  text: string;
};

// ============================
// 式定義
// ============================

export type PyExpression =
  | PyLiteral
  | PyVariable
  | PyBinaryOp
  | PyUnaryOp
  | PyTernaryOp
  | PyCall
  | PyAttribute
  | PySubscript
  | PyCompare
  | PyList
  | PyDict;

// リテラル（数値・文字列・true/false/null）
export type PyLiteral = {
  type: "literal";
  value: string | number | boolean | null;
};

// 変数参照
export type PyVariable = {
  type: "variable";
  name: string;
};

// 二項演算
export type PyBinaryOp = {
  type: "binary";
  operator: string;
  left: PyExpression;
  right: PyExpression;
};

// 単項演算
export type PyUnaryOp = {
  type: "unary";
  operator: string;
  operand: PyExpression;
};

// 三項演算
export type PyTernaryOp = {
  type: "ternary";
  condition: PyExpression;
  trueExpr: PyExpression;
  falseExpr: PyExpression;
};

// 関数・メソッド呼び出し
export type PyCall = {
  type: "call";
  function: PyExpression;
  args: PyExpression[];
};

// 属性アクセス（例: self.rsi）
export type PyAttribute = {
  type: "attribute";
  object: PyExpression;
  attr: string;
};

// 添え字アクセス（例: array[0]）
export type PySubscript = {
  type: "subscript";
  value: PyExpression;
  index: PyExpression;
};

// 比較演算（複数条件対応）
export type PyCompare = {
  type: "compare";
  left: PyExpression;
  operators: string[]; // 例: ['<', '<=']
  comparators: PyExpression[];
};

// リスト
export type PyList = {
  type: "list";
  elements: PyExpression[];
};

// 辞書
export type PyDict = {
  type: "dict";
  entries: { key: PyExpression; value: PyExpression }[];
};

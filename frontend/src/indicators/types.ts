// ====================
// インジケーター全体定義
// ====================
export type Indicator = {
  name: string;
  label: string;
  params: IndicatorParam[];
  lines: IndicatorLine[];
  defaultLineName?: string;
  template?: IndicatorTemplate;
};

// ====================
// パラメータ定義の改善
// ====================

export type NumberIndicatorParam = {
  type: "number";
  name: string;
  label: string;
  required: boolean;
  default?: number;
  min?: number;
  max?: number;
  step?: number;
};

export type SourceIndicatorParam = {
  type: "source";
  name: string;
  label: string;
  required: boolean;
  default?: "open" | "high" | "low" | "close" | "volume";
};

export type AggregationType =
  | "sma"
  | "ema"
  | "rma"
  | "lwma"
  | "smma"
  | "sum"
  | "max"
  | "min"
  | "std"
  | "median"
  | "mean_absolute_deviation";

export type AggregationTypeIndicatorParam = {
  type: "aggregationType";
  name: string;
  label: string;
  required: boolean;
  default?: AggregationType;
  selectableTypes: AggregationType[];
};

export type IndicatorParam =
  | NumberIndicatorParam
  | SourceIndicatorParam
  | AggregationTypeIndicatorParam;

// ====================
// 出力ラインの定義
// ====================
export type IndicatorLine = {
  name: string;
  label: string;
};

// ====================
// テンプレート定義
// ====================

export type IndicatorTemplate = {
  variables: VariableDefinition[];
  exports: ExportLine[];
};

export type VariableDefinition = {
  name: string;
  expression: AggregationExpression | VariableExpression;
  description?: string;
};

export type ExportLine = {
  name: string; // 出力ラインの名前
  variableName: string; // 出力する変数名
};

// ====================
// 変数式（VariableExpression）
// ====================

export type VariableExpression =
  | ConstantExpression
  | SourceExpression
  | NumberParamReferenceExpression
  | IndicatorExpression
  | VariableReferenceExpression
  | UnaryOperationExpression
  | BinaryOperationExpression
  | TernaryExpression;

// 定数
export type ConstantExpression = {
  type: "constant";
  value: number;
};

// 外部データ（足やBid/Ask）
export type SourceExpression = {
  type: "source";
  name: string;
  shiftBars?: ConstantExpression | NumberParamReferenceExpression;
};

// パラメーター変数参照
export type NumberParamReferenceExpression = {
  type: "param";
  name: string;
};

// 他の変数参照
export type VariableReferenceExpression = {
  type: "variable";
  name: string;
  shiftBars?: ConstantExpression | NumberParamReferenceExpression;
};

// 指標をネストして使用
export type IndicatorExpression = {
  type: "indicator";
  name: string;
  params?: { [key: string]: string | number | boolean | null };
  source?: VariableExpression;
};

// 単項演算
export type UnaryOperationExpression = {
  type: "unary_op";
  operator: "-" | "abs";
  operand: VariableExpression;
};

// 二項演算
export type BinaryOperationExpression = {
  type: "binary_op";
  operator: "+" | "-" | "*" | "/" | "max" | "min";
  left: VariableExpression;
  right: VariableExpression;
};

// 三項演算 (if 文)
export type TernaryExpression = {
  type: "ternary";
  condition: Condition;
  trueExpr: VariableExpression;
  falseExpr: VariableExpression;
};

// ====================
// 変数式（StringVariableExpression）
// ====================

export type AggregationMethodExpression =
  | AggregationTypeExpression
  | AggregationTypeParamExpression;

export type AggregationTypeExpression = { type: "aggregationType"; value: AggregationType };
export type AggregationTypeParamExpression = { type: "param"; name: string };

// 集計式（過去N本の平均など）
export type AggregationExpression = {
  type: "aggregation";
  method: AggregationMethodExpression;
  source: VariableExpression;
  period: VariableExpression;
};

// 条件式（仮の型）
export type Condition = {
  type: "comparison";
  operator: ">" | "<" | ">=" | "<=" | "==" | "!=";
  left: VariableExpression;
  right: VariableExpression;
};

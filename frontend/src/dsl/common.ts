export type VariableExpression = ScalarExpression | ArrayExpression;

export type ScalarExpression =
  | ConstantExpression
  | NumberParamReferenceExpression
  | (VariableReferenceExpression & { valueType: "scalar" })
  | (PriceExpression & { valueType: "scalar" })
  | UnaryOperationExpression
  | BinaryOperationExpression
  | TernaryExpression;

export type ArrayExpression =
  | (VariableReferenceExpression & { valueType: "array" })
  | (PriceExpression & { valueType: "array" })
  | SourceExpression // always array
  | IndicatorExpression // always array
  | AggregationExpression;

export type ConstantExpression = {
  type: "constant";
  value: number;
};

export type NumberParamReferenceExpression = {
  type: "param";
  name: string;
};

export type VariableReferenceExpression =
  | ScalarVariableReferenceExpression
  | ArrayVariableReferenceExpression;

export type ScalarVariableReferenceExpression = {
  type: "variable";
  name: string;
  valueType: "scalar";
  shiftBars?: ConstantExpression;
  fallback?: ConstantExpression;
};

export type ArrayVariableReferenceExpression = {
  type: "variable";
  name: string;
  valueType: "array";
};

export type PriceExpression = ScalarPriceExpression | ArrayPriceExpression;

export type ScalarPriceExpression = {
  type: "price";
  source:
    | "bid"
    | "ask"
    | "open"
    | "high"
    | "close"
    | "low"
    | "median"
    | "typical"
    | "weighted"
    | "tick_volume"
    | "volume";
  valueType: "scalar";
  shiftBars?: ConstantExpression;
  fallback?: ConstantExpression;
};

export type ArrayPriceExpression = {
  type: "price";
  source: "open" | "high" | "close" | "low" | "tick_volume" | "volume";
  valueType: "array";
};

export type VolumeExpression = ScalarVolumeExpression | ArrayVolumeExpression;

export type ScalarVolumeExpression = {
  type: "price";
  source: "tick" | "real";
  valueType: "scalar";
  shiftBars?: ConstantExpression;
  fallback?: ConstantExpression;
};

export type ArrayVolumeExpression = {
  type: "price";
  source: "tick" | "real";
  valueType: "array";
};

export type SourceExpression = ScalarSourceExpression | ArraySourceExpression;

export type ScalarSourceExpression = {
  type: "source";
  name: string;
  valueType: "scalar";
  shiftBars?: ConstantExpression | NumberParamReferenceExpression;
  fallback?: ConstantExpression | NumberParamReferenceExpression;
};

export type ArraySourceExpression = {
  type: "source";
  name: string;
  valueType: "array";
};

export type IndicatorExpression = {
  type: "indicator";
  name: string;
  params: IndicatorParamValue[];
  lineName: string;
};

export type IndicatorParamValue = {
  name: string;
  type: "number" | "source" | "aggregationType";
  value: string | number;
};

export type AggregationExpression = {
  type: "aggregation";
  method: AggregationMethodExpression;
  source: ArrayExpression;
  period: ScalarExpression;
};

export type AggregationMethodExpression =
  | AggregationTypeExpression
  | AggregationTypeParamExpression;

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

export type AggregationTypeExpression = { type: "aggregationType"; value: AggregationType };
export type AggregationTypeParamExpression = { type: "param"; name: string };

export type UnaryOperationExpression = {
  type: "unary_op";
  operator: "-" | "abs";
  operand: VariableExpression;
};

export type BinaryOperationExpression = {
  type: "binary_op";
  operator: "+" | "-" | "*" | "/" | "max" | "min";
  left: VariableExpression;
  right: VariableExpression;
};

export type TernaryExpression = {
  type: "ternary";
  condition: Condition;
  trueExpr: VariableExpression;
  falseExpr: VariableExpression;
};

export type Condition =
  | ComparisonCondition
  | CrossCondition
  | StateCondition
  | ChangeCondition
  | ContinueCondition
  | GroupCondition;

export type ConditionOperand = ScalarOperand | ArrayOperand;

export type ScalarOperand = ConstantOperand | ScalarVariableOperand | ScalarSourceOperand;

export type ArrayOperand = ArrayVariableOperand | ArraySourceOperand;

export type ConstantOperand = {
  type: "constant";
  value: number;
};

export type ScalarVariableOperand = {
  type: "variable";
  name: string;
  valueType: "scalar";
  shiftBars?: ConstantExpression;
};

export type ArrayVariableOperand = {
  type: "variable";
  name: string;
  valueType: "array";
};

export type ScalarSourceOperand = {
  type: "source";
  name: string;
  valueType: "scalar";
  shiftBars?: ConstantExpression;
};

export type ArraySourceOperand = {
  type: "source";
  name: string;
  valueType: "array";
  shiftBars?: ConstantExpression;
};

export type ComparisonCondition = {
  type: "comparison";
  operator: ">" | "<" | ">=" | "<=" | "==" | "!=";
  left: ScalarOperand;
  right: ScalarOperand;
};

export type CrossCondition = {
  type: "cross";
  direction: "cross_over" | "cross_under";
  left: ConditionOperand;
  right: ConditionOperand;
};

export type StateCondition = {
  type: "state";
  state: "rising" | "falling";
  operand: ArrayOperand;
  consecutiveBars?: number;
};

export type ChangeCondition = {
  type: "change";
  change: "to_true" | "to_false";
  condition: Condition;
  preconditionBars?: number;
  confirmationBars?: number;
};

export type ContinueCondition = {
  type: "continue";
  continue: "true" | "false";
  condition: Condition;
  consecutiveBars?: number;
};

export type GroupCondition = {
  type: "group";
  operator: "and" | "or";
  conditions: Condition[];
};

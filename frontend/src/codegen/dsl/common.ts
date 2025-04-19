export type ScalarExpression =
  | ConstantExpression
  | NumberParamReferenceExpression
  | ScalarPriceExpression
  | BarValueExpression
  | IndicatorExpression
  | AggregationExpression
  | ScalarUnaryOperationExpression
  | ScalarBinaryOperationExpression
  | ScalarTernaryExpression;
export type BarExpression = PriceExpression | SourceExpression | VariableReferenceExpression;

export type ConstantExpression = {
  type: "constant";
  value: number;
  valueType: "scalar";
};

export type PermanentVariableExpression = ConstantExpression | NumberParamReferenceExpression;

export type NumberParamReferenceExpression = {
  type: "param";
  name: string;
  valueType: "scalar";
};

export type VariableReferenceExpression = {
  type: "variable";
  name: string;
  valueType: "bar";
};

export type PriceExpression = {
  type: "price";
  source: "open" | "high" | "close" | "low" | "tick_volume" | "volume";
  valueType: "bar";
};

export type SourceExpression = {
  type: "source";
  name: string;
  valueType: "bar";
};

export type ScalarPriceExpression = {
  type: "scalar_price";
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
  shiftBars?: PermanentVariableExpression;
  fallback?: ScalarExpression;
};

export type BarValueExpression = {
  type: "bar_value";
  source: BarExpression;
  shiftBars?: PermanentVariableExpression;
  fallback?: ScalarExpression;
  valueType: "scalar";
};

export type IndicatorExpression = {
  type: "indicator";
  name: string;
  params: IndicatorParamValue[];
  lineName: string;
  valueType: "scalar";
};

export type IndicatorParamValue =
  | {
    name: string;
    type: "number";
    value: number;
  }
  | {
    name: string;
    type: "aggregationType";
    method: AggregationType;
  }
  | {
    name: string;
    type: "source";
    ref: VariableReferenceExpression;
  };

export type AggregationExpression = {
  type: "aggregation";
  method: AggregationMethodExpression;
  source: BarExpression;
  period: ScalarExpression;
  valueType: "scalar";
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

export type ScalarUnaryOperationExpression = {
  type: "unary_op";
  operator: "-" | "abs";
  operand: ScalarExpression;
  valueType: "scalar";
};

export type ScalarBinaryOperationExpression = {
  type: "binary_op";
  operator: "+" | "-" | "*" | "/" | "max" | "min";
  left: ScalarExpression;
  right: ScalarExpression;
  valueType: "scalar";
};

export type ScalarTernaryExpression = {
  type: "ternary";
  condition: CommonCondition;
  trueExpr: ScalarExpression;
  falseExpr: ScalarExpression;
  valueType: "scalar";
};

export type CommonCondition = Condition<ScalarExpression, BarExpression>;

export type Condition<ScalarExpression, BarExpression> =
  | ComparisonCondition<ScalarExpression>
  | CrossCondition<BarExpression>
  | StateCondition<BarExpression>
  | ChangeCondition<ScalarExpression, BarExpression>
  | ContinueCondition<ScalarExpression, BarExpression>
  | GroupCondition<ScalarExpression, BarExpression>;

export type ConditionOperand = ScalarExpression | BarExpression;

export type ComparisonCondition<ScalarExpression> = {
  type: "comparison";
  operator: ">" | "<" | ">=" | "<=" | "==" | "!=";
  left: ScalarExpression;
  right: ScalarExpression;
};

export type CrossCondition<BarExpression> = {
  type: "cross";
  direction: "cross_over" | "cross_under";
  left: ConstantExpression | BarExpression;
  right: ConstantExpression | BarExpression;
};

export type StateCondition<BarExpression> = {
  type: "state";
  state: "rising" | "falling";
  operand: BarExpression;
  consecutiveBars?: number;
};

export type ChangeCondition<ScalarExpression, BarExpression> = {
  type: "change";
  change: "to_true" | "to_false";
  condition: Condition<ScalarExpression, BarExpression>;
  preconditionBars?: number;
  confirmationBars?: number;
};

export type ContinueCondition<ScalarExpression, BarExpression> = {
  type: "continue";
  continue: "true" | "false";
  condition: Condition<ScalarExpression, BarExpression>;
  consecutiveBars?: number;
};

export type GroupCondition<ScalarExpression, BarExpression> = {
  type: "group";
  operator: "and" | "or";
  conditions: Condition<ScalarExpression, BarExpression>[];
};

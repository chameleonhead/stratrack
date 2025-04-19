export type ScalarExpression<Condition = CommonCondition> =
  | ConstantExpression
  | NumberParamReferenceExpression
  | BarValueExpression
  | IndicatorExpression
  | ScalarPriceExpression
  | AggregationExpression
  | ScalarUnaryOperationExpression<Condition>
  | ScalarBinaryOperationExpression<Condition>
  | ScalarTernaryExpression<Condition>;

export type ArrayExpression = VariableReferenceExpression | PriceExpression | SourceExpression;

export type ConstantExpression = {
  type: "constant";
  value: number;
  valueType: "scalar";
};

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
  shiftBars?: ConstantExpression | NumberParamReferenceExpression;
  fallback?: ScalarExpression<
    Condition<ConstantExpression | NumberParamReferenceExpression, unknown>
  >;
};

export type BarValueExpression = {
  type: "bar_value";
  source: ArrayExpression;
  shiftBars?: ConstantExpression | NumberParamReferenceExpression;
  fallback?: ScalarExpression<
    Condition<ConstantExpression | NumberParamReferenceExpression, unknown>
  >;
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
  source: ArrayExpression;
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

export type ScalarUnaryOperationExpression<Condition = CommonCondition> = {
  type: "unary_op";
  operator: "-" | "abs";
  operand: ScalarExpression<Condition>;
};

export type ScalarBinaryOperationExpression<Condition = CommonCondition> = {
  type: "binary_op";
  operator: "+" | "-" | "*" | "/" | "max" | "min";
  left: ScalarExpression<Condition>;
  right: ScalarExpression<Condition>;
};

export type ScalarTernaryExpression<Condition = CommonCondition> = {
  type: "ternary";
  condition: Condition;
  trueExpr: ScalarExpression<Condition>;
  falseExpr: ScalarExpression<Condition>;
};

export type CommonCondition = Condition<ScalarOperand, ArrayOperand>;

export type Condition<ScalarOperand, ArrayOperand> =
  | ComparisonCondition<ScalarOperand>
  | CrossCondition<ArrayOperand>
  | StateCondition<ArrayOperand>
  | ChangeCondition<ScalarOperand, ArrayOperand>
  | ContinueCondition<ScalarOperand, ArrayOperand>
  | GroupCondition<ScalarOperand, ArrayOperand>;

export type ConditionOperand = ScalarOperand | ArrayOperand;

export type ScalarOperand =
  | ConstantExpression
  | NumberParamReferenceExpression
  | ScalarPriceExpression
  | BarValueExpression;

export type ArrayOperand = VariableReferenceExpression | PriceExpression | SourceExpression;

export type ComparisonCondition<ScalarOperand> = {
  type: "comparison";
  operator: ">" | "<" | ">=" | "<=" | "==" | "!=";
  left: ScalarOperand;
  right: ScalarOperand;
};

export type CrossCondition<ArrayOperand> = {
  type: "cross";
  direction: "cross_over" | "cross_under";
  left: ConstantExpression | ArrayOperand;
  right: ConstantExpression | ArrayOperand;
};

export type StateCondition<ArrayOperand> = {
  type: "state";
  state: "rising" | "falling";
  operand: ArrayOperand;
  consecutiveBars?: number;
};

export type ChangeCondition<ScalarOperand, ArrayOperand> = {
  type: "change";
  change: "to_true" | "to_false";
  condition: Condition<ScalarOperand, ArrayOperand>;
  preconditionBars?: number;
  confirmationBars?: number;
};

export type ContinueCondition<ScalarOperand, ArrayOperand> = {
  type: "continue";
  continue: "true" | "false";
  condition: Condition<ScalarOperand, ArrayOperand>;
  consecutiveBars?: number;
};

export type GroupCondition<ScalarOperand, ArrayOperand> = {
  type: "group";
  operator: "and" | "or";
  conditions: Condition<ScalarOperand, ArrayOperand>[];
};

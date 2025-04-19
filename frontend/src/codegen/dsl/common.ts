export type VariableExpression<Condition = CommonCondition> =
  | ScalarExpression<Condition>
  | ArrayExpression<Condition>
  | UnaryOperationExpression<Condition>
  | BinaryOperationExpression<Condition>
  | TernaryExpression<Condition>;

export type ScalarExpression<Condition = CommonCondition> =
  | ConstantExpression
  | NumberParamReferenceExpression
  | ScalarVariableReferenceExpression
  | ScalarPriceExpression<Condition>
  | ScalarSourceExpression<Condition>
  | ScalarUnaryOperationExpression<Condition>
  | ScalarBinaryOperationExpression<Condition>
  | ScalarTernaryExpression<Condition>;

export type ArrayExpression<Condition = CommonCondition> =
  | ArrayVariableReferenceExpression
  | ArrayPriceExpression
  | ArraySourceExpression
  | IndicatorExpression
  | AggregationExpression<Condition>;

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

export type PriceExpression<Condition = CommonCondition> =
  | ScalarPriceExpression<Condition>
  | ArrayPriceExpression;

export type ScalarPriceExpression<Condition = CommonCondition> = {
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
  shiftBars?: ScalarExpression<Condition>;
  fallback?: ScalarExpression<Condition>;
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

export type SourceExpression<Condition = CommonCondition> =
  | ScalarSourceExpression<Condition>
  | ArraySourceExpression;

export type ScalarSourceExpression<Condition = CommonCondition> = {
  type: "source";
  name: string;
  valueType: "scalar";
  shiftBars?: ScalarExpression<Condition>;
  fallback?: ScalarExpression<Condition>;
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
      value: ArrayVariableReferenceExpression;
    };

export type AggregationExpression<Condition = CommonCondition> = {
  type: "aggregation";
  method: AggregationMethodExpression;
  source: ArrayExpression<Condition>;
  period: ScalarExpression<Condition>;
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

export type UnaryOperationExpression<Condition = CommonCondition> = {
  type: "unary_op";
  operator: "-" | "abs";
  operand: VariableExpression<Condition>;
};

export type ScalarBinaryOperationExpression<Condition = CommonCondition> = {
  type: "binary_op";
  operator: "+" | "-" | "*" | "/" | "max" | "min";
  left: ScalarExpression<Condition>;
  right: ScalarExpression<Condition>;
};

export type BinaryOperationExpression<Condition = CommonCondition> = {
  type: "binary_op";
  operator: "+" | "-" | "*" | "/" | "max" | "min";
  left: VariableExpression<Condition>;
  right: VariableExpression<Condition>;
};

export type ScalarTernaryExpression<Condition = CommonCondition> = {
  type: "ternary";
  condition: Condition;
  trueExpr: ScalarExpression<Condition>;
  falseExpr: ScalarExpression<Condition>;
};

export type TernaryExpression<Condition = CommonCondition> = {
  type: "ternary";
  condition: Condition;
  trueExpr: VariableExpression<Condition>;
  falseExpr: VariableExpression<Condition>;
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
  | ConstantOperand
  | ScalarVariableOperand
  | ScalarPriceOperand
  | ScalarSourceOperand;

export type ArrayOperand = ArrayVariableOperand | ArrayPriceOperand | ArraySourceOperand;

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

export type ScalarPriceOperand = {
  type: "price";
  source: "open" | "high" | "close" | "low" | "tick_volume" | "volume";
  valueType: "scalar";
  shiftBars?: ConstantExpression;
};

export type ArrayPriceOperand = {
  type: "price";
  source: "open" | "high" | "close" | "low" | "tick_volume" | "volume";
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

export type ComparisonCondition<ScalarOperand> = {
  type: "comparison";
  operator: ">" | "<" | ">=" | "<=" | "==" | "!=";
  left: ScalarOperand;
  right: ScalarOperand;
};

export type CrossCondition<ArrayOperand> = {
  type: "cross";
  direction: "cross_over" | "cross_under";
  left: ConstantOperand | ArrayOperand;
  right: ConstantOperand | ArrayOperand;
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

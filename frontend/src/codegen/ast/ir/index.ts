import { AggregationType } from "../../dsl/common";
import { IndicatorParam } from "../../dsl/indicator";

export type IRProgram = {
  aggregations: AggregationType[];
  strategy: IRStrategy;
  indicatorDefs: IRIndicatorDefinition[];
  indicatorInstances: IRIndicatorInstance[];
};

export type IRStrategy = {
  name: string;
  variables: IRVariable[];
  entryConditions: IRCondition[];
  exitConditions: IRCondition[];
};

export type IRIndicatorDefinition = {
  name: string;
  params: IndicatorParam[];
  variables: IRVariable[];
  exportVars: string[];
};

export type IRIndicatorInstance = {
  id: string; // 例: "rsi_1"
  name: string;
  params: IRExpression[];
};

export type IRVariable = {
  name: string;
  expression: IRExpression;
};

export type IRCondition =
  | IRComparisonCondition
  | IRCrossCondition
  | IRStateCondition
  | IRChangeCondition
  | IRContinueCondition
  | IRGroupCondition;

export type IRComparisonCondition = {
  type: "comparison";
  operator: ">" | "<" | ">=" | "<=" | "==" | "!=";
  left: IRExpression;
  right: IRExpression;
};

export type IRCrossCondition = {
  type: "cross";
  direction: "cross_over" | "cross_under";
  left: IRExpression;
  right: IRExpression;
};

export type IRStateCondition = {
  type: "state";
  state: "rising" | "falling";
  operand: IRExpression;
  consecutiveBars?: number;
};

export type IRChangeCondition = {
  type: "change";
  change: "to_true" | "to_false";
  condition: IRCondition;
  preconditionBars?: number;
  confirmationBars?: number;
};

export type IRContinueCondition = {
  type: "continue";
  continue: "true" | "false";
  condition: IRCondition;
  consecutiveBars?: number;
};

export type IRGroupCondition = {
  type: "group";
  operator: "and" | "or";
  conditions: IRCondition[];
};

export type IRExpression =
  | IRConstant
  | IRAggregationTypeValue
  | IRIndicatorRef
  | IRAggregation
  | IRUnaryOp
  | IRBinaryOp
  | IRTernaryOp
  | IRVariableRef
  | IRTemporaryVariableRef
  | IRPriceRef
  | IRBarVariableRef;

export type IRConstant = {
  type: "constant";
  value: number;
};

export type IRAggregationTypeValue = {
  type: "aggregation_type_value";
  method: AggregationType;
};

export type IRIndicatorRef = {
  type: "indicator_ref";
  refId: string; // indicator instance id
};

export type IRAggregation = {
  type: "aggregation";
  method: AggregationType;
  source: IRExpression;
  period: IRExpression;
};

export type IRUnaryOp = {
  type: "unary";
  operator: "-" | "abs";
  operand: IRExpression;
};

export type IRBinaryOp = {
  type: "binary";
  operator: "+" | "-" | "*" | "/" | "max" | "min";
  left: IRExpression;
  right: IRExpression;
};

export type IRTernaryOp = {
  type: "ternary";
  condition: IRCondition;
  trueExpr: IRExpression;
  falseExpr: IRExpression;
};

export type IRPriceRef = {
  type: "price_ref";
  source: string;
};

export type IRVariableRef = {
  type: "variable_ref";
  name: string;
};

export type IRTemporaryVariableRef = {
  type: "temporary_variable_ref";
  name: string;
};

export type IRBarVariableRef = {
  type: "bar_variable_ref";
  source: IRVariableRef | IRPriceRef | IRTemporaryVariableRef;
  shiftBar?: IRExpression;
  fallback?: IRExpression;
};

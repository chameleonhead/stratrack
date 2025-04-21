import {
  AggregationType,
  BarShiftExpression,
  Condition,
  ConstantExpression,
  ParamReferenceExpression,
  PriceExpression,
  ScalarExpression,
  SourceExpression,
  VariableReferenceExpression,
} from "./common";

export type Indicator = {
  name: string;
  label: string;
  params: IndicatorParam[];
  lines: IndicatorLine[];
  defaultLineName?: string;
  template: IndicatorTemplate;
};

export type IndicatorParam =
  | NumberIndicatorParam
  | SourceIndicatorParam
  | AggregationTypeIndicatorParam;

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
  default?:
    | "open"
    | "high"
    | "low"
    | "close"
    | "median"
    | "typical"
    | "weighted"
    | "tick_volume"
    | "volume";
};

export type AggregationTypeIndicatorParam = {
  type: "aggregationType";
  name: string;
  label: string;
  required: boolean;
  default?: AggregationType;
  selectableTypes: AggregationType[];
};

export type IndicatorLine = {
  name: string;
  label: string;
};

export type IndicatorTemplate = {
  variables: IndicatorVariableDefinition[];
  exports: ExportLine[];
};

export type ExportLine = {
  name: string;
  variableName: string;
};

export type IndicatorVariableDefinition = {
  name: string;
  expression: IndicatorVariableExpression;
  invalidPeriod?: ScalarExpression;
  fallback?: ScalarExpression;
  description?: string;
};

export type IndicatorVariableExpression = Exclude<ScalarExpression, PriceExpression>;

export type IndicatorCondition = Condition<
  ConstantExpression | ParamReferenceExpression | BarShiftExpression,
  VariableReferenceExpression | SourceExpression
>;

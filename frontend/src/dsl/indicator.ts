import {
  AggregationType,
  ConstantExpression,
  NumberParamReferenceExpression,
  PriceExpression,
  VariableExpression,
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
  default?: "open" | "high" | "low" | "close" | "median" | "typical" | "weighted" | "volume";
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
  invalidPeriod?: IndicatorVariableExpression;
  fallback?: VariableFallbackDefinition;
  description?: string;
};

export type VariableFallbackDefinition = {
  expression: IndicatorVariableExpression;
  invalidPeriod?: ConstantExpression | NumberParamReferenceExpression;
  fallback?: ConstantExpression | NumberParamReferenceExpression;
};

export type IndicatorVariableExpression = Exclude<VariableExpression, PriceExpression>;

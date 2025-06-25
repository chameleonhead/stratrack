import { IndicatorDefinition, StrategyAnalysisContext } from "../analyzers";
import { IndicatorParam, IndicatorVariableDefinition } from "../dsl/indicator";
import {
  BarExpression,
  CommonCondition,
  IndicatorParamValue,
  ScalarExpression,
  TimeframeExpression,
} from "../dsl/common";
import {
  IRProgram,
  IRStrategy,
  IRIndicatorInstance,
  IRVariable,
  IRExpression,
  IRConstant,
  IRVariableRef,
  IRIndicatorRef,
  IRAggregation,
  IRUnaryOp,
  IRBinaryOp,
  IRTernaryOp,
  IRCondition,
  IRComparisonCondition,
  IRCrossCondition,
  IRStateCondition,
  IRChangeCondition,
  IRContinueCondition,
  IRGroupCondition,
  IRBarShift,
  IRPriceRef,
  IRSourceParamRef,
  IRIndicatorDefinition,
  IRAggregationTypeValue,
  IRConstantParamRef,
  IRTimeframeExpression,
} from "./ast";
import { StrategyVariableDefinition } from "../dsl/strategy";

type IndicatorContext = {
  map: Map<string, string>;
  currentDefinition?: IndicatorDefinition;
  variableTimeframes: Map<string, TimeframeExpression | undefined>;
};

export function buildIRFromAnalysis(ctx: StrategyAnalysisContext): IRProgram {
  const indicatorContext = {
    map: new Map(),
    variableTimeframes: new Map<string, TimeframeExpression | undefined>(),
  } as IndicatorContext;

  const indicatorInstances: IRIndicatorInstance[] = ctx.indicatorInstances.map(
    (instance, index) => {
      const key = `${instance.name}::${JSON.stringify(instance.params)}`;
      const id = `ind${index + 1}`;
      indicatorContext.map.set(key, id);
      return {
        id,
        name: instance.name,
        pascalName: pascal(instance.name),
        params: instance.params.map((p) => ({
          name: p.name,
          value: mapIndicatorParamValue(p, indicatorContext),
        })),
      };
    }
  );

  const indicatorDefs: IRIndicatorDefinition[] = ctx.indicatorDefinitions.map(
    (definition, index) => {
      indicatorContext.variableTimeframes = new Map(
        definition.indicator.template.variables.map((v) => [v.name, v.timeframe])
      );
      const irVars = definition.indicator.template.variables.map((v) => {
        indicatorContext.currentDefinition = definition;
        return mapIndicatorVariable(v, indicatorContext);
      });
      const exports = definition.indicator.template.exports.map((e) => e.variableName);
      return {
        id: `${definition.name}_${index + 1}`,
        name: definition.name,
        pascalName: pascal(definition.name),
        params: definition.params,
        outputLine: definition.indicator.defaultLineName ?? exports[0],
        variables: irVars,
        indicators: definition.indicatorInstances.map((instance, i) => {
          const key = `${instance.name}::${JSON.stringify(instance.params)}`;
          const id = `${definition.name}_${i + 1}`;
          indicatorContext.map.set(key, id);
          return {
            id,
            name: instance.name,
            pascalName: pascal(instance.name),
            params: instance.params.map((p) => ({
              name: p.name,
              value: mapIndicatorParamValue(p, indicatorContext),
            })),
          };
        }),
        exportVars: exports,
        usedAggregations: Array.from(definition.usedAggregationTypes),
      };
    }
  );

  delete indicatorContext.currentDefinition;
  indicatorContext.variableTimeframes = new Map(
    (ctx.strategy.variables ?? []).map((v) => [v.name, v.timeframe])
  );

  const strategy: IRStrategy = {
    name: "Generated",
    variables: ctx.strategy.variables?.map((v) => mapStrategyVariable(v, indicatorContext)) ?? [],
    indicators: indicatorInstances,
    entryConditions: ctx.strategy.entry.map((e) => ({
      type: e.type,
      condition: mapCondition(e.condition, indicatorContext),
    })),
    exitConditions: ctx.strategy.exit.map((e) => ({
      type: e.type,
      condition: mapCondition(e.condition, indicatorContext),
    })),
    usedAggregations: Array.from(ctx.usedAggregationTypes),
  };

  return {
    aggregations: Array.from(ctx.usedAggregationTypes),
    strategy,
    indicatorDefs,
  };
}

function mapStrategyVariable(
  v: StrategyVariableDefinition,
  indicatorContext: IndicatorContext
): IRVariable {
  return {
    name: v.name,
    dataType: v.dataType,
    timeframe: mapTimeframeExpression(v.timeframe, indicatorContext),
    expression: mapExpression(v.expression, indicatorContext),
    invalidPeriod: v.invalidPeriod ? mapExpression(v.invalidPeriod, indicatorContext) : undefined,
    fallback: v.fallback ? mapExpression(v.fallback, indicatorContext) : undefined,
  };
}

function mapIndicatorVariable(
  v: IndicatorVariableDefinition,
  indicatorContext: IndicatorContext
): IRVariable {
  return {
    name: v.name,
    dataType: v.dataType,
    timeframe: mapTimeframeExpression(v.timeframe, indicatorContext),
    expression: mapExpression(v.expression, indicatorContext),
    invalidPeriod: v.invalidPeriod ? mapExpression(v.invalidPeriod, indicatorContext) : undefined,
    fallback: v.fallback ? mapExpression(v.fallback, indicatorContext) : undefined,
  };
}

function mapIndicatorParamValue(
  v: IndicatorParamValue,
  indicatorContext: IndicatorContext
): IRExpression {
  switch (v.type) {
    case "aggregationType":
      return { type: "aggregation_type_value", method: v.method } satisfies IRAggregationTypeValue;
    case "number":
      return { type: "constant", value: v.value } satisfies IRConstant;
    case "source":
      return mapExpression(v.ref, indicatorContext);
    default:
      throw new Error(`Unsupported Parameter Value type: ${JSON.stringify(v)}`);
  }
}

function mapTimeframeExpression(
  tf: TimeframeExpression | undefined,
  ctx: IndicatorContext
): IRTimeframeExpression | undefined {
  if (!tf) return undefined;
  switch (tf.type) {
    case "constant":
      return { type: "constant", value: tf.value };
    case "param":
      return { type: "constant_param_ref", name: tf.name };
    case "variable":
      return {
        type: "variable_ref",
        name: tf.name,
        timeframe: mapTimeframeExpression(ctx.variableTimeframes.get(tf.name), ctx),
      };
    default:
      return undefined;
  }
}

function mapExpression(
  expr: ScalarExpression | BarExpression,
  indicatorContext: IndicatorContext
): IRExpression {
  function resolveIndicatorRefId(expr: ScalarExpression): string {
    if (expr.type !== "indicator") throw new Error("Invalid indicator expression");
    const key = `${expr.name}::${JSON.stringify(expr.params)}`;
    return indicatorContext.map.get(key) ?? `unknown_${expr.name}`;
  }
  switch (expr.type) {
    case "constant":
      return { type: "constant", value: expr.value } satisfies IRConstant;
    case "source":
      return { type: "source_param_ref", name: expr.name } satisfies IRSourceParamRef;
    case "price":
      return {
        type: "price_ref",
        source: expr.source,
        timeframe: mapTimeframeExpression(expr.timeframe, indicatorContext),
      } satisfies IRPriceRef;
    case "param":
      return { type: "constant_param_ref", name: expr.name } satisfies IRConstantParamRef;
    case "variable":
      return {
        type: "variable_ref",
        name: expr.name,
        timeframe: mapTimeframeExpression(
          indicatorContext.variableTimeframes.get(expr.name),
          indicatorContext
        ),
      } satisfies IRVariableRef;
    case "scalar_price": {
      const ref = {
        type: "price_ref",
        source: expr.source,
        timeframe: mapTimeframeExpression(expr.timeframe, indicatorContext),
      } as IRPriceRef;
      const shiftBar = expr.shiftBars
        ? mapExpression(expr.shiftBars, indicatorContext)
        : ({ type: "constant", value: 0 } as IRExpression);
      const fallback = expr.fallback
        ? mapExpression(expr.fallback, indicatorContext)
        : ({ type: "constant", value: 0 } as IRExpression);
      return {
        type: "bar_shift",
        source: ref,
        shiftBar,
        fallback,
        timeframe: ref.timeframe,
      } satisfies IRBarShift;
    }
    case "bar_shift": {
      const ref = mapExpression(expr.source, indicatorContext) as IRPriceRef | IRVariableRef;
      const shiftBar = expr.shiftBars
        ? mapExpression(expr.shiftBars, indicatorContext)
        : ({ type: "constant", value: 0 } as IRExpression);
      const fallback = expr.fallback
        ? mapExpression(expr.fallback, indicatorContext)
        : ({ type: "constant", value: 0 } as IRExpression);
      return {
        type: "bar_shift",
        source: ref,
        shiftBar,
        fallback,
        timeframe: "timeframe" in ref ? (ref as IRPriceRef | IRVariableRef).timeframe : undefined,
      } satisfies IRBarShift;
    }
    case "indicator":
      return {
        type: "indicator_ref",
        refId: resolveIndicatorRefId(expr),
        name: expr.name,
        pascalName: pascal(expr.name),
        params: expr.params.map((p) => ({
          name: p.name,
          value: mapIndicatorParamValue(p, indicatorContext),
        })),
        lineName: expr.lineName,
      } satisfies IRIndicatorRef;
    case "aggregation": {
      const source = mapExpression(expr.source, indicatorContext);
      const fallback = expr.fallback ? mapExpression(expr.fallback, indicatorContext) : undefined;
      const period = mapExpression(expr.period, indicatorContext);
      if (expr.method.type === "aggregationType") {
        return {
          type: "aggregation",
          method: expr.method.value,
          source,
          fallback,
          period,
        } satisfies IRAggregation;
      } else {
        const definition = indicatorContext.currentDefinition;
        if (!definition) {
          throw new Error("Current definition is not set");
        }
        const name = expr.method.name;
        const aggregationTypes = definition.params
          .filter((p) => p.type === "aggregationType" && p.name === name)
          .flatMap(
            (p) => (p as Extract<IndicatorParam, { type: "aggregationType" }>).selectableTypes
          );

        return aggregationTypes.splice(1).reduce(
          (acc: IRExpression, type) => {
            return {
              type: "ternary",
              condition: {
                type: "comparison",
                operator: "==",
                left: {
                  type: "aggregation_type_value",
                  method: type,
                } satisfies IRAggregationTypeValue,
                right: {
                  type: "constant_param_ref",
                  name,
                } satisfies IRConstantParamRef,
              },
              trueExpr: {
                type: "aggregation",
                method: type,
                source,
                fallback,
                period,
              } satisfies IRAggregation,
              falseExpr: acc,
            } satisfies IRTernaryOp;
          },
          {
            type: "aggregation",
            method: aggregationTypes[0],
            source,
            fallback,
            period,
          } satisfies IRAggregation
        );
      }
    }
    case "unary_op":
      return {
        type: "unary",
        operator: expr.operator,
        operand: mapExpression(expr.operand, indicatorContext),
      } satisfies IRUnaryOp;
    case "binary_op":
      return {
        type: "binary",
        operator: expr.operator,
        left: mapExpression(expr.left, indicatorContext),
        right: mapExpression(expr.right, indicatorContext),
      } satisfies IRBinaryOp;
    case "ternary":
      return {
        type: "ternary",
        condition: mapCondition(expr.condition, indicatorContext),
        trueExpr: mapExpression(expr.trueExpr, indicatorContext),
        falseExpr: mapExpression(expr.falseExpr, indicatorContext),
      } satisfies IRTernaryOp;
    default:
      throw new Error(`Unsupported expression type: ${(expr as { type: string }).type}`);
  }
}

function mapCondition(cond: CommonCondition, indicatorContext: IndicatorContext): IRCondition {
  switch (cond.type) {
    case "comparison":
      return {
        type: "comparison",
        operator: cond.operator,
        left: mapExpression(cond.left, indicatorContext),
        right: mapExpression(cond.right, indicatorContext),
      } satisfies IRComparisonCondition;
    case "cross":
      return {
        type: "cross",
        direction: cond.direction,
        left: mapExpression(cond.left, indicatorContext),
        right: mapExpression(cond.right, indicatorContext),
      } satisfies IRCrossCondition;
    case "state":
      return {
        type: "state",
        state: cond.state,
        operand: mapExpression(cond.operand, indicatorContext),
        consecutiveBars: cond.consecutiveBars,
      } satisfies IRStateCondition;
    case "change":
      return {
        type: "change",
        change: cond.change,
        condition: mapCondition(cond.condition, indicatorContext),
        preconditionBars: cond.preconditionBars,
        confirmationBars: cond.confirmationBars,
      } satisfies IRChangeCondition;
    case "continue":
      return {
        type: "continue",
        continue: cond.continue,
        condition: mapCondition(cond.condition, indicatorContext),
        consecutiveBars: cond.consecutiveBars,
      } satisfies IRContinueCondition;
    case "group":
      return {
        type: "group",
        operator: cond.operator,
        conditions: cond.conditions.map((c) => mapCondition(c, indicatorContext)),
      } satisfies IRGroupCondition;
    default:
      throw new Error(`Unsupported condition type: ${(cond as { type: string }).type}`);
  }
}

function pascal(snake: string): string {
  return snake
    .split("_")
    .filter(Boolean) // 空文字を除去（例: __abc）
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

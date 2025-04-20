import { StrategyAnalysisContext } from "../../analyzers";
import { IndicatorVariableDefinition } from "../../dsl/indicator";
import {
  BarExpression,
  CommonCondition,
  IndicatorParamValue,
  ScalarExpression,
} from "../../dsl/common";
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
  IRBarVariableRef,
  IRPriceRef,
  IRTemporaryVariableRef,
  IRIndicatorDefinition,
  IRAggregationTypeValue,
} from ".";

export function buildIRFromAnalysis(ctx: StrategyAnalysisContext): IRProgram {
  const indicatorRefMap = new Map<string, string>();
  const strategy: IRStrategy = {
    name: "Generated",
    variables: ctx.strategy.variables?.map((v) => mapStrategyVariable(v, indicatorRefMap)) ?? [],
    entryConditions: ctx.strategy.entry.map((e) => mapCondition(e.condition, indicatorRefMap)),
    exitConditions: ctx.strategy.exit.map((e) => mapCondition(e.condition, indicatorRefMap)),
  };

  const indicatorDefs: IRIndicatorDefinition[] = ctx.indicatorDefinitions.map((instance, index) => {
    const irVars = instance.indicator.template.variables.map((v) =>
      mapIndicatorVariable(v, indicatorRefMap)
    );
    const exports = instance.indicator.template.exports.map((e) => e.variableName);
    return {
      id: `${instance.name}_${index + 1}`,
      name: instance.name,
      params: instance.params,
      outputLine: instance.indicator.defaultLineName ?? exports[0],
      variables: irVars,
      exportVars: exports,
    };
  });

  const indicatorInstances: IRIndicatorInstance[] = ctx.indicatorInstances.map(
    (instance, index) => {
      const key = `${instance.callerId}::${instance.name}::${JSON.stringify(instance.params)}`;
      const id = `${instance.name}_${index + 1}`;
      indicatorRefMap.set(key, id);
      return {
        id: `${instance.name}_${index + 1}`,
        name: instance.name,
        params: instance.params.map((p) => mapIndicatorParamValue(p, indicatorRefMap)),
      };
    }
  );

  return {
    aggregations: Array.from(ctx.usedAggregationTypes),
    strategy,
    indicatorDefs,
    indicatorInstances,
  };
}

function mapStrategyVariable(
  v: { name: string; expression: ScalarExpression },
  indicatorRefMap: Map<string, string>
): IRVariable {
  return {
    name: v.name,
    expression: mapExpression(v.expression, indicatorRefMap),
  };
}

function mapIndicatorVariable(
  v: IndicatorVariableDefinition,
  indicatorRefMap: Map<string, string>
): IRVariable {
  return {
    name: v.name,
    expression: mapExpression(v.expression, indicatorRefMap),
  };
}

function mapIndicatorParamValue(
  v: IndicatorParamValue,
  indicatorRefMap: Map<string, string>
): IRExpression {
  switch (v.type) {
    case "aggregationType":
      return { type: "aggregation_type_value", method: v.method } satisfies IRAggregationTypeValue;
    case "number":
      return { type: "constant", value: v.value } satisfies IRConstant;
    case "source":
      return mapExpression(v.ref, indicatorRefMap);
    default:
      throw new Error(`Unsupported Parameter Value type: ${JSON.stringify(v)}`);
  }
}

function mapExpression(
  expr: ScalarExpression | BarExpression,
  indicatorRefMap: Map<string, string>
): IRExpression {
  function resolveIndicatorRefId(expr: ScalarExpression): string {
    if (expr.type !== "indicator") throw new Error("Invalid indicator expression");
    const key = `${expr.name}::${JSON.stringify(expr.params)}`;
    return indicatorRefMap.get(key) ?? `unknown_${expr.name}`;
  }
  switch (expr.type) {
    case "constant":
      return { type: "constant", value: expr.value } satisfies IRConstant;
    case "source":
      return { type: "temporary_variable_ref", name: expr.name } satisfies IRTemporaryVariableRef;
    case "price":
      return { type: "price_ref", source: expr.source } satisfies IRPriceRef;
    case "param":
    case "variable":
      return { type: "variable_ref", name: expr.name } satisfies IRVariableRef;
    case "scalar_price": {
      const ref = { type: "price_ref", source: expr.source } as IRPriceRef;
      const shiftBar = expr.shiftBars
        ? mapExpression(expr.shiftBars, indicatorRefMap)
        : ({ type: "constant", value: 0 } as IRExpression);
      const fallback = expr.fallback
        ? mapExpression(expr.fallback, indicatorRefMap)
        : ({ type: "constant", value: 0 } as IRExpression);
      return {
        type: "bar_variable_ref",
        source: ref,
        shiftBar,
        fallback,
      } satisfies IRBarVariableRef;
    }
    case "bar_value": {
      const ref = mapExpression(expr.source, indicatorRefMap) as IRPriceRef | IRVariableRef;
      const shiftBar = expr.shiftBars
        ? mapExpression(expr.shiftBars, indicatorRefMap)
        : ({ type: "constant", value: 0 } as IRExpression);
      const fallback = expr.fallback
        ? mapExpression(expr.fallback, indicatorRefMap)
        : ({ type: "constant", value: 0 } as IRExpression);
      return {
        type: "bar_variable_ref",
        source: ref,
        shiftBar,
        fallback,
      } satisfies IRBarVariableRef;
    }
    case "indicator":
      return { type: "indicator_ref", refId: resolveIndicatorRefId(expr) } satisfies IRIndicatorRef; // 後でリンク解決
    case "aggregation":
      return {
        type: "aggregation",
        method: expr.method.type === "aggregationType" ? expr.method.value : "sma",
        source: mapExpression(expr.source, indicatorRefMap),
        period: mapExpression(expr.period, indicatorRefMap),
      } satisfies IRAggregation;
    case "unary_op":
      return {
        type: "unary",
        operator: expr.operator,
        operand: mapExpression(expr.operand, indicatorRefMap),
      } satisfies IRUnaryOp;
    case "binary_op":
      return {
        type: "binary",
        operator: expr.operator,
        left: mapExpression(expr.left, indicatorRefMap),
        right: mapExpression(expr.right, indicatorRefMap),
      } satisfies IRBinaryOp;
    case "ternary":
      return {
        type: "ternary",
        condition: mapCondition(expr.condition, indicatorRefMap),
        trueExpr: mapExpression(expr.trueExpr, indicatorRefMap),
        falseExpr: mapExpression(expr.falseExpr, indicatorRefMap),
      } satisfies IRTernaryOp;
    default:
      throw new Error(`Unsupported expression type: ${(expr as { type: string }).type}`);
  }
}

function mapCondition(cond: CommonCondition, indicatorRefMap: Map<string, string>): IRCondition {
  switch (cond.type) {
    case "comparison":
      return {
        type: "comparison",
        operator: cond.operator,
        left: mapExpression(cond.left, indicatorRefMap),
        right: mapExpression(cond.right, indicatorRefMap),
      } satisfies IRComparisonCondition;
    case "cross":
      return {
        type: "cross",
        direction: cond.direction,
        left: mapExpression(cond.left, indicatorRefMap),
        right: mapExpression(cond.right, indicatorRefMap),
      } satisfies IRCrossCondition;
    case "state":
      return {
        type: "state",
        state: cond.state,
        operand: mapExpression(cond.operand, indicatorRefMap),
        consecutiveBars: cond.consecutiveBars,
      } satisfies IRStateCondition;
    case "change":
      return {
        type: "change",
        change: cond.change,
        condition: mapCondition(cond.condition, indicatorRefMap),
        preconditionBars: cond.preconditionBars,
        confirmationBars: cond.confirmationBars,
      } satisfies IRChangeCondition;
    case "continue":
      return {
        type: "continue",
        continue: cond.continue,
        condition: mapCondition(cond.condition, indicatorRefMap),
        consecutiveBars: cond.consecutiveBars,
      } satisfies IRContinueCondition;
    case "group":
      return {
        type: "group",
        operator: cond.operator,
        conditions: cond.conditions.map((c) => mapCondition(c, indicatorRefMap)),
      } satisfies IRGroupCondition;
    default:
      throw new Error(`Unsupported condition type: ${(cond as { type: string }).type}`);
  }
}

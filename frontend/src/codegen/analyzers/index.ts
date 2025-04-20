import { AggregationType, BarExpression, ScalarExpression } from "../dsl/common";
import { Indicator, IndicatorParam, IndicatorTemplate } from "../dsl/indicator";
import { StrategyTemplate } from "../dsl/strategy";
import { visitScalarExpression, visitCondition } from "./visitors";

export type StrategyAnalysisResult = {
  usedIndicators: Map<string, IndicatorParam[]>;
  usedAggregationTypes: Set<AggregationType>;
  variableDependencyOrder: string[];
  variableDependencyGraph: Map<string, Set<string>>;
  errors: string[];
};

export function analyzeTemplate(
  template: StrategyTemplate | IndicatorTemplate,
  availableIndicators: Record<string, Indicator>,
  usedIndicators: Map<string, IndicatorParam[]> = new Map(),
  usedAggregationTypes: Set<AggregationType> = new Set()
): StrategyAnalysisResult {
  const usedIndicatorsWithStringParam: Map<string, Set<string>> = new Map();
  Array.from(usedIndicators.entries()).forEach(([name, params]) => {
    usedIndicatorsWithStringParam.set(name, new Set(JSON.stringify(params)));
  });
  const usedAggregationTypesNew = new Set(usedAggregationTypes);
  const dependencyGraph = new Map<string, Set<string>>();
  const errors: string[] = [];

  const processExpr = (expr: ScalarExpression | BarExpression, fromVar?: string) => {
    if (expr.type === "indicator") {
      if (!usedIndicatorsWithStringParam.has(expr.name)) {
        usedIndicatorsWithStringParam.set(expr.name, new Set());
      }
      usedIndicatorsWithStringParam.get(expr.name)?.add(JSON.stringify(expr.params));
      const indicatorDef = availableIndicators[expr.name];
      if (!indicatorDef) {
        errors.push(`未定義のインジケーターが使用されています: ${expr.name}`);
        return;
      }

      // パラメーター検証
      for (const paramDef of indicatorDef.params) {
        const userParam = expr.params.find((p) => p.name === paramDef.name);
        if (!userParam && paramDef.required) {
          errors.push(
            `インジケーター '${expr.name}' の必須パラメーター '${paramDef.name}' が指定されていません`
          );
        } else if (userParam && userParam.type !== paramDef.type) {
          errors.push(
            `インジケーター '${expr.name}' のパラメーター '${paramDef.name}' の型が不一致です`
          );
        }
      }

      // 出力ライン名の検証
      const lineExists = indicatorDef.lines.some((line) => line.name === expr.lineName);
      if (!lineExists) {
        errors.push(`インジケーター '${expr.name}' にライン '${expr.lineName}' は存在しません`);
      }

      // 集約関数の記録
      expr.params.forEach((p) => {
        if (p.type === "aggregationType") {
          usedAggregationTypesNew.add(p.method);
        }
      });
    } else if (expr.type === "aggregation") {
      if (expr.method.type === "aggregationType") {
        usedAggregationTypesNew.add(expr.method.value);
      }
    } else if (expr.type === "variable") {
      if (fromVar) {
        dependencyGraph.get(fromVar)?.add(expr.name);
      }
    }
  };

  // Track dependencies from variables
  for (const v of template.variables ?? []) {
    const currentVar = v.name;
    dependencyGraph.set(currentVar, new Set());
    visitScalarExpression(v.expression, (e) => processExpr(e, currentVar));
  }

  // Entry and exit condition indicators
  if ((template as StrategyTemplate).entry) {
    for (const e of (template as StrategyTemplate).entry) {
      visitCondition(e.condition, processExpr);
    }
  }
  if ((template as StrategyTemplate).exit) {
    for (const e of (template as StrategyTemplate).exit) {
      visitCondition(e.condition, processExpr);
    }
  }

  // Topological sort
  const variableDependencyOrder: string[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  function dfs(node: string) {
    if (visited.has(node)) return;
    if (visiting.has(node)) {
      errors.push(`循環参照が検出されました: ${node}`);
      return;
    }
    visiting.add(node);
    for (const dep of dependencyGraph.get(node) ?? []) {
      dfs(dep);
    }
    visiting.delete(node);
    visited.add(node);
    variableDependencyOrder.push(node);
  }

  for (const node of dependencyGraph.keys()) {
    dfs(node);
  }

  usedIndicators.clear();
  usedIndicatorsWithStringParam.forEach((params, name) => {
    const parsedParams = Array.from(params).map((p) => JSON.parse(p));
    usedIndicators.set(name, parsedParams);
  });

  return {
    usedIndicators,
    usedAggregationTypes,
    variableDependencyOrder: variableDependencyOrder.reverse(),
    variableDependencyGraph: dependencyGraph,
    errors,
  };
}

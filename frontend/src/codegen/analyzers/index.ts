import {
  AggregationType,
  BarExpression,
  IndicatorParamValue,
  ScalarExpression,
} from "../dsl/common";
import { Indicator, IndicatorParam, IndicatorTemplate } from "../dsl/indicator";
import { StrategyTemplate } from "../dsl/strategy";
import { visitCondition, visitScalarExpression } from "./visitors";

// ==========================
// 分析結果（分析フェーズ）
// ==========================
export type StrategyAnalysisResult = {
  usedIndicators: Map<string, IndicatorParamValue[][]>;
  usedAggregationTypes: Set<AggregationType>;
  variableDependencyOrder: string[];
  variableDependencyGraph: Map<string, Set<string>>;
  errors: string[];
};

export type IndicatorDefinition = {
  name: string;
  params: IndicatorParam[];
  indicator: Indicator;
};

export type IndicatorInstance = {
  callerId: number;
  name: string;
  params: IndicatorParamValue[];
  indicator: Indicator;
};

export type StrategyAnalysisContext = {
  strategy: StrategyTemplate;
  indicatorDefinitions: IndicatorDefinition[];
  indicatorInstances: IndicatorInstance[];
  usedAggregationTypes: Set<AggregationType>;
  variableDependencyOrder: string[];
  variableDependencyGraph: Map<string, Set<string>>;
  errors: string[];
};

// ==========================
// 分析実行
// ==========================
export function analyzeStrategyWithDependencies(
  strategy: StrategyTemplate,
  indicatorCatalog: Record<string, Indicator>
): StrategyAnalysisContext {
  const indicatorDefinitions: IndicatorDefinition[] = [];
  const indicatorInstances: IndicatorInstance[] = [];
  const usedAggregationTypes = new Set<AggregationType>();
  const errors: string[] = [];

  const ctxUsedIndicators = new Map<string, IndicatorParamValue[][]>();

  let callerId: number = 0;
  const result = analyzeTemplate(
    strategy,
    indicatorCatalog,
    ctxUsedIndicators,
    usedAggregationTypes
  );

  const queue = Array.from(ctxUsedIndicators.entries()).map(([name, params]) => ({
    callerId,
    name,
    paramsList: params,
  }));

  while (queue.length) {
    const { callerId: cid, name, paramsList } = queue.pop()!;
    const indicator = indicatorCatalog[name];
    if (!indicator) {
      errors.push(`インジケーター定義が見つかりません: ${name}`);
      continue;
    }
    if (!indicatorDefinitions.some((i) => callerId !== cid && i.name === name)) {
      indicatorDefinitions.push({ name, params: indicator.params, indicator });

      callerId++;
      const nestedCtx = new Map<string, IndicatorParamValue[][]>();
      analyzeTemplate(indicator.template, indicatorCatalog, nestedCtx, usedAggregationTypes);

      for (const [nestedName, nestedParams] of nestedCtx.entries()) {
        queue.push({ callerId, name: nestedName, paramsList: nestedParams });
      }
    }

    for (const params of paramsList) {
      indicatorInstances.push({ callerId: cid, name, params, indicator });
    }
  }

  return {
    strategy,
    indicatorDefinitions,
    indicatorInstances,
    usedAggregationTypes,
    variableDependencyOrder: result.variableDependencyOrder,
    variableDependencyGraph: result.variableDependencyGraph,
    errors: [...result.errors, ...errors],
  };
}

export function analyzeTemplate(
  template: StrategyTemplate | IndicatorTemplate,
  availableIndicators: Record<string, Indicator>,
  usedIndicators: Map<string, IndicatorParamValue[][]> = new Map(),
  usedAggregationTypes: Set<AggregationType> = new Set()
): StrategyAnalysisResult {
  const usedIndicatorsWithStringParam: Map<string, Set<string>> = new Map();
  Array.from(usedIndicators.entries()).forEach(([name, params]) => {
    usedIndicatorsWithStringParam.set(name, new Set(JSON.stringify(params)));
  });
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
          usedAggregationTypes.add(p.method);
        }
      });
    } else if (expr.type === "aggregation") {
      if (expr.method.type === "aggregationType") {
        usedAggregationTypes.add(expr.method.value);
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
    usedIndicators.set(name, parsedParams as IndicatorParamValue[][]);
  });

  return {
    usedIndicators,
    usedAggregationTypes,
    variableDependencyOrder: variableDependencyOrder.reverse(),
    variableDependencyGraph: dependencyGraph,
    errors,
  };
}

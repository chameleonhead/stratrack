import { Indicator } from "../dsl/indicator";
import { analyzeTemplate, StrategyAnalysisContext } from "../analyzers";
import { buildIRFromAnalysis } from "../ir/builder";
import { convertIrToMqlProgram, renderMqlProgram } from "../mql";

export function renderIndicatorMql(indicator: Indicator): string {
  const analysis = analyzeTemplate(indicator.template, {
    [indicator.name]: indicator,
  });
  const ctx: StrategyAnalysisContext = {
    strategy: {
      variables: [],
      entry: [],
      exit: [],
      riskManagement: { type: "fixed", lotSize: 0 },
    },
    indicatorDefinitions: [
      {
        name: indicator.name,
        params: indicator.params,
        indicator,
        indicatorInstances: [],
        usedAggregationTypes: analysis.usedAggregationTypes,
      },
    ],
    indicatorInstances: [],
    usedAggregationTypes: analysis.usedAggregationTypes,
    variableDependencyOrder: analysis.variableDependencyOrder,
    variableDependencyGraph: analysis.variableDependencyGraph,
    errors: analysis.errors,
  };
  const ir = buildIRFromAnalysis(ctx);
  const mqlProgram = convertIrToMqlProgram(ir);
  return renderMqlProgram(mqlProgram);
}

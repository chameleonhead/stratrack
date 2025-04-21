import { analyzeStrategyWithDependencies } from "../analyzers";
import { Indicator } from "../dsl/indicator";
import { StrategyTemplate } from "../dsl/strategy";
import { buildIRFromAnalysis } from "../ir/builder";
import { convertIrToMqlProgram, renderMqlProgram } from "../mql";
import { convertIrToBtProgramFromIR, renderPythonBtProgram } from "../python";

export function renderStrategyCode(
  language: string,
  template: StrategyTemplate,
  indicators: Indicator[]
): string {
  const analysis = analyzeStrategyWithDependencies(
    template as StrategyTemplate,
    indicators.reduce(
      (acc, i) => {
        acc[i.name] = i;
        return acc;
      },
      {} as Record<string, Indicator>
    )
  );
  const ir = buildIRFromAnalysis(analysis);
  if (language === "python") {
    const pythonAst = convertIrToBtProgramFromIR(ir);
    return renderPythonBtProgram(pythonAst);
  }
  if (language === "mql4") {
    const mqlProgram = convertIrToMqlProgram(ir);
    return renderMqlProgram(mqlProgram);
  }
  return "";
}

import { Suspense, useMemo } from "react";
import CodeEditor from "../components/CodeEditor";
import { useLocalValue } from "../hooks/useLocalValue";
import StrategyTemplateEditor from "./components/StrategyTemplateEditor";
import { renderStrategyCode } from "../codegen/generators/strategyCodeRenderer";
import BasicInfo from "./sections/BasicInfo";
import { useIndicatorList } from "../indicators/IndicatorProvider";
import { Strategy, StrategyTemplate } from "../codegen/dsl/strategy";
import { analyzeStrategyWithDependencies } from "../codegen/analyzers";
import { Indicator } from "../codegen/dsl/indicator";
import { buildIRFromAnalysis } from "../codegen/ir/builder";
import { convertIrToMqlProgram, renderMqlProgram } from "../codegen/mql";

export type StrategyEditorProps = {
  value?: Partial<Strategy>;
  onChange?: (value: Partial<Strategy>) => void;
};

function StrategyEditor({ value, onChange }: StrategyEditorProps) {
  const indicators = useIndicatorList();
  const [localValue, setLocalValue] = useLocalValue(
    {
      template: {
        variables: [],
        entry: [],
        exit: [],
        riskManagement: { type: "percentage", percent: 100 },
      } as StrategyTemplate,
    } as Partial<Strategy>,
    value,
    onChange
  );
  return (
    <div className="grid space-y-4">
      <BasicInfo value={localValue} onChange={setLocalValue} />
      <StrategyTemplateEditor value={localValue} onChange={setLocalValue} />
      <Suspense fallback={<div className="text-red-500">エラーが発生しました。</div>}>
        <CodeEditor
          language="python"
          value={useMemo(
            () => renderStrategyCode("python", localValue.template as StrategyTemplate, indicators),
            [localValue, indicators]
          )}
        />
        <CodeEditor
          language="mql4"
          value={useMemo(() => {
            const analysis = analyzeStrategyWithDependencies(
              localValue.template as StrategyTemplate,
              indicators.reduce(
                (acc, i) => {
                  acc[i.name] = i;
                  return acc;
                },
                {} as Record<string, Indicator>
              )
            );
            const ir = buildIRFromAnalysis(analysis);
            const mqlProgram = convertIrToMqlProgram(ir);
            return renderMqlProgram(mqlProgram);
          }, [localValue, indicators])}
        />
      </Suspense>
    </div>
  );
}

export default StrategyEditor;

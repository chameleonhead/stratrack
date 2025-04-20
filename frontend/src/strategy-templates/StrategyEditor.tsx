import { Suspense, useMemo } from "react";
import CodeEditor from "../components/CodeEditor";
import { useLocalValue } from "../hooks/useLocalValue";
import StrategyTemplateEditor from "./components/StrategyTemplateEditor";
import { renderStrategyCode } from "../codegen/generators/strategyCodeRenderer";
import BasicInfo from "./sections/BasicInfo";
import { useIndicatorList } from "../indicators/IndicatorProvider";
import { Strategy, StrategyTemplate } from "../codegen/dsl/strategy";
import { analyzeTemplate } from "../codegen/analyzers";
import { Indicator } from "../codegen/dsl/indicator";

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
    (v) => {
      console.log(
        "StrategyEditor",
        analyzeTemplate(
          v.template!,
          indicators.reduce(
            (acc, i) => {
              acc[i.name] = i;
              return acc;
            },
            {} as Record<string, Indicator>
          )
        )
      );
      if (onChange) {
        onChange(v);
      }
    }
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
          value={useMemo(
            () => renderStrategyCode("mql4", localValue.template as StrategyTemplate, indicators),
            [localValue, indicators]
          )}
        />
      </Suspense>
    </div>
  );
}

export default StrategyEditor;

import { useMemo } from "react";
import CodeEditor from "../../components/CodeEditor";
import { useLocalValue } from "../../hooks/useLocalValue";
import StrategyTemplateEditor from "./components/StrategyTemplateEditor";
import { renderStrategyCode } from "../../codegen/generators/strategyCodeRenderer";
import BasicInfo from "./sections/BasicInfo";
import { useIndicatorList } from "../indicators/IndicatorProvider";
import { Strategy, StrategyTemplate } from "../../codegen/dsl/strategy";
import Tab from "../../components/Tab";

const DEFAULT_TEMPLATE: StrategyTemplate = {
  variables: [],
  entry: [],
  exit: [],
  riskManagement: { type: "percentage", percent: 100 },
};

export type StrategyEditorProps = {
  value?: Partial<Strategy>;
  onChange?: (value: Partial<Strategy>) => void;
};

function StrategyEditor({ value, onChange }: StrategyEditorProps) {
  const indicators = useIndicatorList();
  const [localValue, setLocalValue] = useLocalValue(
    { template: DEFAULT_TEMPLATE } as Partial<Strategy>,
    value,
    onChange
  );

  const template = useMemo(
    () => ({ ...DEFAULT_TEMPLATE, ...localValue.template }),
    [localValue.template]
  );

  return (
    <div className="grid space-y-4">
      <BasicInfo value={localValue} onChange={setLocalValue} />
      <StrategyTemplateEditor value={localValue} onChange={setLocalValue} />
      <Tab
        tabs={[
          {
            id: "python",
            label: "Python",
            content: (
              <CodeEditor
                language="python"
                value={useMemo(
                  () => renderStrategyCode("python", template, indicators),
                  [template, indicators]
                )}
                readOnly
              />
            ),
          },
          {
            id: "mql4",
            label: "MQL4",
            content: (
              <CodeEditor
                language="mql4"
                value={useMemo(
                  () => renderStrategyCode("mql4", template, indicators),
                  [template, indicators]
                )}
                readOnly
              />
            ),
          },
        ]}
      />
    </div>
  );
}

export default StrategyEditor;

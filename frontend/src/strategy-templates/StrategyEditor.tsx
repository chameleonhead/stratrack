import { useMemo } from "react";
import PythonEditor from "../components/PythonEditor";
import { useLocalValue } from "../hooks/useLocalValue";
import StrategyTemplateEditor from "./components/StrategyTemplateEditor";
import { renderStrategyCode } from "./generators/strategyCodeRenderer";
import BasicInfo from "./sections/BasicInfo";
import { Strategy, StrategyTemplate } from "./types";

export type StrategyEditorProps = {
  value?: Partial<Strategy>;
  onChange?: (value: Partial<Strategy>) => void;
};

function StrategyEditor({ value, onChange }: StrategyEditorProps) {
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
      <PythonEditor
        value={useMemo(
          () => renderStrategyCode(localValue.template as StrategyTemplate),
          [localValue]
        )}
      />
    </div>
  );
}

export default StrategyEditor;

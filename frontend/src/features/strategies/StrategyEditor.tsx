import { useEffect, useMemo, useRef } from "react";
import CodeEditor from "../../components/CodeEditor";
import StrategyTemplateEditor from "./components/StrategyTemplateEditor";
import { renderStrategyCode } from "../../codegen/generators/strategyCodeRenderer";
import BasicInfo from "./sections/BasicInfo";
import { useIndicatorList } from "../indicators/IndicatorProvider";
import { Strategy, StrategyTemplate } from "../../codegen/dsl/strategy";
import Tab from "../../components/Tab";
import { DEFAULT_TEMPLATE, createStrategyEditorStore } from "./store/strategyEditorStore";

export type StrategyEditorProps = {
  value?: Partial<Strategy>;
  onChange?: (value: Partial<Strategy>) => void;
};

function StrategyEditor({ value, onChange }: StrategyEditorProps) {
  const indicators = useIndicatorList();
  const storeRef = useRef(createStrategyEditorStore(value));
  const useStore = storeRef.current;
  const localValue = useStore((s) => s.value);
  const setValue = useStore((s) => s.setValue);
  const update = useStore((s) => s.update);

  // initialize store value from prop when the component mounts or when the
  // provided value changes from the outside
  useEffect(() => {
    if (value) {
      setValue(value);
    }
  }, [value, setValue]);

  useEffect(() => {
    if (onChange) {
      onChange(localValue);
    }
  }, [localValue, onChange]);

  const template = useMemo(
    () => ({ ...DEFAULT_TEMPLATE, ...localValue.template }),
    [localValue.template]
  );

  return (
    <div className="grid space-y-4">
      <BasicInfo value={localValue} onChange={update} />
      <StrategyTemplateEditor
        value={localValue.template}
        onChange={(template) => update({ template: template as StrategyTemplate })}
      />
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

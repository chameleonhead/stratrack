import { useCallback, useMemo } from "react";
import EntryLogic from "../sections/EntryLogic";
import PositionManagement from "../sections/PositionManagement";
import Variables from "../sections/Variables";
import ExitLogic from "../sections/ExitLogic";
import RiskManagement from "../sections/RiskManagement";
import FilterConditions from "../sections/FilterConditions";
import TimingControl from "../sections/TimingControl";
import MultiPosition from "../sections/MultiPosition";
import VariableProvider from "./VariableProvider";
import Tab from "../../components/Tab";
import { useLocalValue } from "../../hooks/useLocalValue";
import { Strategy, StrategyTemplate } from "../../dsl/strategy";

export type StrategyTemplateEditorProps = {
  value?: Partial<Strategy>;
  onChange: (value: Partial<Strategy>) => void;
};

function StrategyTemplateEditor({ value, onChange }: StrategyTemplateEditorProps) {
  const [localValue, setLocalValue] = useLocalValue<Partial<Strategy>>({}, value, onChange);
  const template = useMemo(() => {
    return (
      localValue.template ||
      ({
        variables: [],
        entry: [],
        exit: [],
      } as Partial<StrategyTemplate>)
    );
  }, [localValue]);
  const setTemplate = useCallback(
    (newvalue: Partial<StrategyTemplate>) => {
      setLocalValue({
        ...localValue,
        template: { ...localValue.template, ...newvalue } as StrategyTemplate,
      });
    },
    [setLocalValue, localValue]
  );
  return (
    <VariableProvider variables={template.variables || []}>
      <Tab
        tabs={[
          {
            id: "variables",
            label: "変数設定",
            content: <Variables value={template} onChange={setTemplate} />,
          },
          {
            id: "entry",
            label: "エントリー戦略",
            content: <EntryLogic value={template} onChange={setTemplate} />,
          },
          {
            id: "exit",
            label: "イグジット戦略",
            content: <ExitLogic value={template} onChange={setTemplate} />,
          },
          {
            id: "positionManagement",
            label: "保有中戦略",
            content: <PositionManagement value={template} onChange={setTemplate} />,
          },
          {
            id: "riskManagement",
            label: "リスク・ロット戦略",
            content: <RiskManagement value={template} onChange={setTemplate} />,
          },
          {
            id: "filterConditions",
            label: "フィルター条件",
            content: <FilterConditions value={template} onChange={setTemplate} />,
          },
          {
            id: "timingControl",
            label: "タイミング制御",
            content: <TimingControl value={template} onChange={setTemplate} />,
          },
          {
            id: "multiPosition",
            label: "複数ポジション戦略",
            content: <MultiPosition value={template} onChange={setTemplate} />,
          },
        ]}
      />
    </VariableProvider>
  );
}

export default StrategyTemplateEditor;

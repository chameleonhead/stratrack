import StrategyConditionBuilder from "./StrategyConditionBuilder";
import NumberInput from "../../../components/NumberInput";
import Select from "../../../components/Select";
import { useLocalValue } from "../../../hooks/useLocalValue";
import { StrategyCondition } from "../../../codegen/dsl/strategy";

type StrategyChangeCondition = Extract<StrategyCondition, { type: "change" }>;

export type StrategyChangeConditionSelectorProps = {
  name?: string;
  value: Partial<StrategyChangeCondition>;
  onChange: (value: Partial<StrategyChangeCondition>) => void;
};

const CHANGE_OPTIONS = [
  { value: "to_true", label: "false → true への変化" },
  { value: "to_false", label: "true → false への変化" },
];

function StrategyChangeConditionSelector({
  value,
  onChange,
}: StrategyChangeConditionSelectorProps) {
  const [condition, setCondition] = useLocalValue({ type: "change" }, value, onChange);

  return (
    <div className="grid gap-4 items-center">
      <div className="grid md:grid-cols-3 gap-4 items-center">
        <Select
          label="変化"
          fullWidth
          value={condition.change}
          onChange={(val) =>
            setCondition({
              ...condition,
              change: val as StrategyChangeCondition["change"],
            })
          }
          options={CHANGE_OPTIONS}
        />
        <NumberInput
          label="変化前期間"
          fullWidth
          value={condition.preconditionBars || 1}
          onChange={(val) =>
            setCondition({
              ...condition,
              preconditionBars: val as StrategyChangeCondition["preconditionBars"],
            })
          }
        />
        <NumberInput
          label="変化後期間"
          fullWidth
          value={condition.confirmationBars || 1}
          onChange={(val) =>
            setCondition({
              ...condition,
              confirmationBars: val as StrategyChangeCondition["confirmationBars"],
            })
          }
        />
      </div>
      <div>
        <StrategyConditionBuilder
          value={condition.condition}
          onChange={(val) =>
            setCondition({
              ...condition,
              condition: val as StrategyChangeCondition["condition"],
            })
          }
        />
      </div>
    </div>
  );
}

export default StrategyChangeConditionSelector;

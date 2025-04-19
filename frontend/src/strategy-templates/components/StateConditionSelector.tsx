import OperandSelector from "./ConditionOperandSelector";
import Select from "../../components/Select";
import NumberInput from "../../components/NumberInput";
import { useLocalValue } from "../../hooks/useLocalValue";
import { StateCondition } from "../../codegen/dsl/common";

export type StateConditionSelectorProps = {
  name?: string;
  value: Partial<StateCondition>;
  onChange: (value: Partial<StateCondition>) => void;
};

const STATE_OPTIONS = [
  { value: "rising", label: "上昇傾向 (Rising)" },
  { value: "falling", label: "下降傾向 (Falling)" },
];

function StateConditionSelector({ value, onChange }: StateConditionSelectorProps) {
  const [condition, setCondition] = useLocalValue({ type: "state" }, value, onChange);
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div className="col-span-1">
          <Select
            label="状態"
            fullWidth
            value={condition.state}
            onChange={(val) =>
              setCondition({
                ...condition,
                state: val as StateCondition["state"],
              })
            }
            options={STATE_OPTIONS}
          />
        </div>
        <div className="col-span-1">
          <NumberInput
            label="期間"
            fullWidth
            value={condition.consecutiveBars}
            onChange={(val) =>
              setCondition({
                ...condition,
                consecutiveBars: val as StateCondition["consecutiveBars"],
              })
            }
            placeholder="期間（任意）"
          />
        </div>
      </div>
      <div>
        <OperandSelector
          allowedTypes={["array_variable"]}
          value={condition.operand}
          onChange={(val) =>
            setCondition({
              ...condition,
              operand: val as StateCondition["operand"],
            })
          }
        />
      </div>
    </div>
  );
}

export default StateConditionSelector;

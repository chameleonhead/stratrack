import { StateCondition } from "../types";
import OperandSelector from "./ConditionOperandSelector";
import Select from "../../components/Select";
import NumberInput from "../../components/NumberInput";
import { useLocalValue } from "../../hooks/useLocalValue";

export type StateConditionSelectorProps = {
  name?: string;
  value: Partial<StateCondition>;
  onChange: (value: Partial<StateCondition>) => void;
};

const STATE_OPTIONS = [
  { value: "rising", label: "上昇傾向 (Rising)" },
  { value: "falling", label: "下降傾向 (Falling)" },
];

function StateConditionSelector({
  value,
  onChange,
}: StateConditionSelectorProps) {
  const [condition, setCondition] = useLocalValue(
    { type: "state" },
    value,
    onChange
  );
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
      <OperandSelector
        value={condition.operand}
        onChange={(val) =>
          setCondition({
            ...condition,
            operand: val as StateCondition["operand"],
          })
        }
      />

      <Select
        value={condition.state}
        onChange={(val) =>
          setCondition({
            ...condition,
            state: val as StateCondition["state"],
          })
        }
        options={STATE_OPTIONS}
      />

      <NumberInput
        value={condition.length}
        onChange={(val) =>
          setCondition({
            ...condition,
            length: val as StateCondition["length"],
          })
        }
        placeholder="期間（任意）"
      />
    </div>
  );
}

export default StateConditionSelector;

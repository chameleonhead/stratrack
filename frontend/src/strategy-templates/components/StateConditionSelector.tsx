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
    <div className="grid gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div className="col-span-1">
          <Select
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
            fullWidth
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
      </div>
      <div>
        <OperandSelector
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

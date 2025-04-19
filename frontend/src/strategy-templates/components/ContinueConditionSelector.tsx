import Select from "../../components/Select";
import NumberInput from "../../components/NumberInput";
import { useLocalValue } from "../../hooks/useLocalValue";
import ConditionBuilder from "./ConditionBuilder";
import { Condition, ContinueCondition } from "../../codegen/dsl/common";

export type ContinueConditionSelectorProps = {
  name?: string;
  value: Partial<ContinueCondition>;
  onChange: (value: Partial<ContinueCondition>) => void;
};

const STATE_OPTIONS = [
  { value: "true", label: "真が継続" },
  { value: "false", label: "偽が継続" },
];

function ContinueConditionSelector({ value, onChange }: ContinueConditionSelectorProps) {
  const [condition, setCondition] = useLocalValue({ type: "continue" }, value, onChange);
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div className="col-span-1">
          <Select
            label="条件"
            fullWidth
            value={condition.continue}
            onChange={(val) =>
              setCondition({
                ...condition,
                continue: val as ContinueCondition["continue"],
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
                consecutiveBars: val as ContinueCondition["consecutiveBars"],
              })
            }
            placeholder="期間（任意）"
          />
        </div>
      </div>
      <div>
        <ConditionBuilder
          value={condition.condition as Partial<Condition> | undefined}
          onChange={(val) =>
            setCondition({
              ...condition,
              condition: val as ContinueCondition["condition"],
            })
          }
        />
      </div>
    </div>
  );
}

export default ContinueConditionSelector;

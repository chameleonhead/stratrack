import ConditionRow from "./ConditionBuilder";
import Select from "../../components/Select";
import { useLocalValue } from "../../hooks/useLocalValue";
import { ChangeCondition } from "../../codegen/dsl/common";

export type ChangeConditionSelectorProps = {
  name?: string;
  value: Partial<ChangeCondition>;
  onChange: (value: Partial<ChangeCondition>) => void;
};

const CHANGE_OPTIONS = [
  { value: "to_true", label: "false → true への変化" },
  { value: "to_false", label: "true → false への変化" },
];

function ChangeConditionSelector({ value, onChange }: ChangeConditionSelectorProps) {
  const [condition, setCondition] = useLocalValue({ type: "change" }, value, onChange);

  return (
    <div className="grid gap-4 items-center">
      <div>
        <Select
          fullWidth
          value={condition.change}
          onChange={(val) =>
            setCondition({
              ...condition,
              change: val as ChangeCondition["change"],
            })
          }
          options={CHANGE_OPTIONS}
        />
      </div>
      <div>
        <ConditionRow
          value={condition.condition}
          onChange={(val) =>
            setCondition({
              ...condition,
              condition: val as ChangeCondition["condition"],
            })
          }
        />
      </div>
    </div>
  );
}

export default ChangeConditionSelector;

import { GroupCondition } from "../types";
import ConditionBuilder from "./ConditionBuilder";
import Select from "../../components/Select";
import { useLocalValue } from "../../hooks/useLocalValue";

export type GroupConditionSelectorProps = {
  name?: string;
  value: Partial<GroupCondition>;
  onChange: (value: Partial<GroupCondition>) => void;
};

const LOGIC_OPTIONS = [
  { value: "and", label: "すべて満たす（AND）" },
  { value: "or", label: "いずれか満たす（OR）" },
];

function GroupConditionSelector({
  value,
  onChange,
}: GroupConditionSelectorProps) {
  const [condition, setCondition] = useLocalValue(
    { type: "group" },
    value,
    onChange
  );

  return (
    <div className="space-y-4">
      <Select
        value={condition.operator || "and"}
        onChange={(val) =>
          setCondition({
            ...condition,
            operator: val as GroupCondition["operator"],
          })
        }
        options={LOGIC_OPTIONS}
      />

      <ConditionBuilder
        value={condition.conditions}
        onChange={(val) =>
          setCondition({
            ...condition,
            conditions: val as GroupCondition["conditions"],
          })
        }
      />
    </div>
  );
}

export default GroupConditionSelector;

import { Condition } from "../types";
import ConditionRow from "./ConditionRow";
import Button from "../../components/Button";
import { useLocalValue } from "../../hooks/useLocalValue";

export type ConditionBuilderProps = {
  value?: Partial<Condition>[];
  onChange?: (value: Partial<Condition>[]) => void;
};

function ConditionBuilder({ value, onChange }: ConditionBuilderProps) {
  const [localValue, setLocalValue] = useLocalValue([], value, onChange);

  const updateCondition = (index: number, newCondition: Partial<Condition>) => {
    const newConditions = [...localValue];
    newConditions[index] = newCondition;
    setLocalValue(newConditions);
  };

  const addCondition = () => {
    setLocalValue([
      ...localValue,
      {
        type: "comparison",
        operator: ">",
        left: { type: "constant", value: 0 },
        right: { type: "constant", value: 0 },
      },
    ]);
  };

  return (
    <div className="space-y-4">
      {localValue.map((condition, index) => (
        <ConditionRow
          key={index}
          value={condition}
          onChange={(updated) => updateCondition(index, updated)}
        />
      ))}

      <Button type="button" onClick={addCondition}>
        条件を追加
      </Button>
    </div>
  );
}

export default ConditionBuilder;

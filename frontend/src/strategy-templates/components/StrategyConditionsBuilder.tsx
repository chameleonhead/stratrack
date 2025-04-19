import ConditionRow from "./StrategyConditionBuilder";
import Button from "../../components/Button";
import { useLocalValue } from "../../hooks/useLocalValue";
import { StrategyCondition } from "../../codegen/dsl/strategy";

export type StrategyConditionBuilderProps = {
  value?: Partial<StrategyCondition>[];
  onChange?: (value: Partial<StrategyCondition>[]) => void;
};

function StrategyConditionBuilder({ value, onChange }: StrategyConditionBuilderProps) {
  const [localValue, setLocalValue] = useLocalValue([], value, onChange);

  const updateCondition = (index: number, newCondition: Partial<StrategyCondition>) => {
    const newConditions = [...localValue];
    newConditions[index] = newCondition;
    setLocalValue(newConditions);
  };

  const deleteCondition = (index: number) => {
    const newConditions = [...localValue];
    newConditions.splice(index, 1);
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
          onDelete={() => deleteCondition(index)}
        />
      ))}

      <Button type="button" onClick={addCondition}>
        条件を追加
      </Button>
    </div>
  );
}

export default StrategyConditionBuilder;

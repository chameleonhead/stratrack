import StrategyConditionBuilder from "./StrategyConditionBuilder";
import Button from "../../components/Button";
import { useLocalValue } from "../../hooks/useLocalValue";
import { StrategyCondition } from "../../codegen/dsl/strategy";
import { useCallback, useMemo } from "react";

export type StrategyConditionsBuilderProps = {
  value?: Partial<StrategyCondition>[];
  onChange?: (value: Partial<StrategyCondition>[]) => void;
};

function StrategyConditionsBuilder({ value, onChange }: StrategyConditionsBuilderProps) {
  const [localValue, setLocalValue] = useLocalValue([], value, onChange);

  const updateCondition = useCallback(
    (index: number, newCondition: Partial<StrategyCondition>) => {
      setLocalValue((localValue) => {
        const newConditions = [...localValue];
        newConditions[index] = newCondition;
        return newConditions;
      });
    },
    [setLocalValue]
  );

  const deleteCondition = useCallback(
    (index: number) => {
      setLocalValue((localValue) => {
        const newConditions = [...localValue];
        newConditions.splice(index, 1);
        return newConditions;
      });
    },
    [setLocalValue]
  );

  const addCondition = useCallback(() => {
    setLocalValue((localValue) => [
      ...localValue,
      {
        type: "comparison",
        operator: ">",
        left: { type: "constant", value: 0 },
        right: { type: "constant", value: 0 },
      },
    ]);
  }, [setLocalValue]);

  return (
    <div className="space-y-4">
      {useMemo(
        () =>
          localValue.map((condition, index) => (
            <StrategyConditionBuilder
              key={index}
              value={condition}
              onChange={(updated) => updateCondition(index, updated)}
              onDelete={() => deleteCondition(index)}
            />
          )),
        [localValue, updateCondition, deleteCondition]
      )}

      <Button type="button" onClick={addCondition}>
        条件を追加
      </Button>
    </div>
  );
}

export default StrategyConditionsBuilder;

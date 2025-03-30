import { Condition } from "../types";
import ConditionRow from "./ConditionRow";
import Button from "../../components/Button";

export type ConditionBuilderProps = {
  value: (Condition | undefined)[];
  onChange: (value: (Condition | undefined)[]) => void;
};

const ConditionBuilder: React.FC<ConditionBuilderProps> = ({
  value,
  onChange,
}) => {
  const updateCondition = (
    index: number,
    newCondition: Condition | undefined
  ) => {
    const newConditions = [...value];
    if (newCondition) {
      newConditions[index] = newCondition;
    } else {
      newConditions.splice(index, 1);
    }
    onChange(newConditions);
  };

  const addCondition = () => {
    onChange([
      ...value,
      {
        type: "comparison",
        operator: ">",
        left: { type: "number", value: 0 },
        right: { type: "number", value: 0 },
      },
    ]);
  };

  return (
    <div className="space-y-4">
      {value.map((condition, index) => (
        <ConditionRow
          key={index}
          value={condition}
          onChange={(updated) => updateCondition(index, updated)}
        />
      ))}

      <Button onClick={addCondition}>条件を追加</Button>
    </div>
  );
};

export default ConditionBuilder;

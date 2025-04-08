import { CrossCondition } from "../types";
import OperandSelector from "./ConditionOperandSelector";
import Select from "../../components/Select";
import { useLocalValue } from "../../hooks/useLocalValue";

export type CrossConditionSelectorProps = {
  name?: string;
  value?: Partial<CrossCondition>;
  onChange: (value: Partial<CrossCondition>) => void;
};

const CROSS_DIRECTIONS = [
  { value: "cross_over", label: "上抜け (Cross Over)" },
  { value: "cross_under", label: "下抜け (Cross Under)" },
];

function CrossConditionSelector({
  name,
  value,
  onChange,
}: CrossConditionSelectorProps) {
  const [condtion, setCondition] = useLocalValue(
    { type: "cross" },
    value,
    onChange
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
      <OperandSelector
        name={`${name}.left`}
        value={condtion.left}
        onChange={(left) =>
          setCondition({ ...condtion, left: left as CrossCondition["left"] })
        }
      />

      <Select
        name={`${name}.direction`}
        value={condtion.direction}
        onChange={(direction) =>
          setCondition({
            ...condtion,
            direction: direction as CrossCondition["direction"],
          })
        }
        options={CROSS_DIRECTIONS}
      />

      <OperandSelector
        value={condtion.right}
        onChange={(right) =>
          setCondition({ ...condtion, right: right as CrossCondition["right"] })
        }
      />
    </div>
  );
}

export default CrossConditionSelector;

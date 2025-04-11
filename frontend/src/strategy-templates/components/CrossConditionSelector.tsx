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
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
      <div className="col-span-1 md:col-span-2">
        <OperandSelector
          name={`${name}.left`}
          value={condtion.left}
          onChange={(left) =>
            setCondition({ ...condtion, left: left as CrossCondition["left"] })
          }
        />
      </div>
      <div className="col-span-1">
        <Select
          fullWidth
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
      </div>
      <div className="col-span-1 md:col-span-2">
        <OperandSelector
          value={condtion.right}
          onChange={(right) =>
            setCondition({
              ...condtion,
              right: right as CrossCondition["right"],
            })
          }
        />
      </div>
    </div>
  );
}

export default CrossConditionSelector;

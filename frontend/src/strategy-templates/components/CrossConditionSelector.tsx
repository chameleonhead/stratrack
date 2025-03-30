import { useState, useEffect } from "react";
import { CrossCondition, Operand } from "../types";
import OperandSelector from "./OperandSelector";
import Select from "../../components/Select";

export type CrossConditionSelectorProps = {
  value: CrossCondition | undefined;
  onChange: (value: CrossCondition | undefined) => void;
};

const CROSS_DIRECTIONS = [
  { value: "cross_over", label: "上抜け (Cross Over)" },
  { value: "cross_under", label: "下抜け (Cross Under)" },
];

function CrossConditionSelector({
  value,
  onChange,
}: CrossConditionSelectorProps) {
  const [left, setLeft] = useState<Operand | undefined>(value?.left);
  const [right, setRight] = useState<Operand | undefined>(value?.right);
  const [direction, setDirection] = useState<CrossCondition["direction"]>(
    value?.direction || "cross_over"
  );

  useEffect(() => {
    if (left && right && direction) {
      onChange({ type: "cross", left, right, direction });
    } else {
      onChange(undefined);
    }
  }, [onChange, left, right, direction]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
      <OperandSelector value={left} onChange={setLeft} />

      <Select
        value={direction}
        onChange={(val) => setDirection(val as CrossCondition["direction"])}
        options={CROSS_DIRECTIONS}
      />

      <OperandSelector value={right} onChange={setRight} />
    </div>
  );
}

export default CrossConditionSelector;

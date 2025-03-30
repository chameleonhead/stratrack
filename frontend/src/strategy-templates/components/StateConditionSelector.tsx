import React, { useEffect, useState } from "react";
import { StateCondition, Operand } from "../types";
import OperandSelector from "./OperandSelector";
import Select from "../../components/Select";
import NumberInput from "../../components/NumberInput";

export type StateConditionSelectorProps = {
  value: StateCondition | undefined;
  onChange: (value: StateCondition | undefined) => void;
};

const STATE_OPTIONS = [
  { value: "rising", label: "上昇傾向 (Rising)" },
  { value: "falling", label: "下降傾向 (Falling)" },
];

const StateConditionSelector: React.FC<StateConditionSelectorProps> = ({
  value,
  onChange,
}) => {
  const [operand, setOperand] = useState<Operand | undefined>(value?.operand);
  const [state, setState] = useState<StateCondition["state"]>(
    value?.state || "rising"
  );
  const [length, setLength] = useState<number | undefined>(value?.length);

  useEffect(() => {
    if (operand && state) {
      onChange({ type: "state", operand, state, length });
    } else {
      onChange(undefined);
    }
  }, [onChange, operand, state, length]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
      <OperandSelector value={operand} onChange={setOperand} />

      <Select
        value={state}
        onChange={(val) => setState(val as StateCondition["state"])}
        options={STATE_OPTIONS}
      />

      <NumberInput
        value={length ?? null}
        onChange={(val) => setLength(val ?? undefined)}
        placeholder="期間（任意）"
      />
    </div>
  );
};

export default StateConditionSelector;

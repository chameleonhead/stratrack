import { useState } from "react";
import Select from "../../components/Select";
import { ConditionOperand } from "../types";
import NumberInput from "../../components/NumberInput";
import { useVariables } from "./useVariables";

export type ConditionOperandSelectorProps = {
  name?: string;
  value?: ConditionOperand;
  onChange: (value: ConditionOperand | undefined) => void;
};

function ConditionOperandSelector({
  name,
  value,
  onChange,
}: ConditionOperandSelectorProps) {
  const [type, setType] = useState(value?.type);

  return (
    <div className="space-y-2">
      {/* Operand Type 選択 */}
      <Select
        name={`${name}.type`}
        value={type}
        onChange={(val) => setType(val as ConditionOperand["type"])}
        options={[
          { value: "constant", label: "数値" },
          { value: "variable", label: "変数" },
        ]}
      />

      {type === "constant" && (
        <NumberConditionOperandSelector
          value={value?.type === "constant" ? value : undefined}
          onChange={onChange}
        />
      )}
      {type === "variable" && (
        <VariableConditionOperandSelector
          value={value?.type === "variable" ? value : undefined}
          onChange={onChange}
        />
      )}
    </div>
  );
}

type NumberConditionOperandSelectorProps = {
  value?: Extract<ConditionOperand, { type: "constant" }>;
  onChange: (value: ConditionOperand | undefined) => void;
};

function NumberConditionOperandSelector({
  value,
  onChange,
}: NumberConditionOperandSelectorProps) {
  return (
    <NumberInput
      placeholder="定数（数値）"
      value={value?.value ?? null}
      onChange={(val) => {
        if (val !== null) {
          onChange({
            type: "constant",
            value: val as Extract<ConditionOperand, { type: "constant" }>["value"],
          });
        } else {
          onChange(undefined);
        }
      }}
    />
  );
}

type VariableConditionOperandSelectorProps = {
  value?: Extract<ConditionOperand, { type: "variable" }>;
  onChange: (value: ConditionOperand | undefined) => void;
};

// VariableConditionOperandSelector の追加
function VariableConditionOperandSelector({
  value,
  onChange,
}: VariableConditionOperandSelectorProps) {
  const variables = useVariables();
  return (
    <Select
      value={value?.name}
      onChange={(val) => {
        if (val) {
          onChange({ type: "variable", name: val });
        } else {
          onChange(undefined);
        }
      }}
      options={variables.map((v) => ({
        value: v.name,
        label: `${v.name} ${v.description ? `(${v.description})` : ""}`,
      }))}
    />
  );
}

export default ConditionOperandSelector;

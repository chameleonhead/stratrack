import Select from "../../components/Select";
import NumberInput from "../../components/NumberInput";
import { useVariables } from "./useVariables";
import { useLocalValue } from "../../hooks/useLocalValue";
import { ConditionOperand } from "../../codegen/dsl/common";

export type ConditionOperandSelectorProps = {
  name?: string;
  value?: Partial<ConditionOperand>;
  onChange: (value: Partial<ConditionOperand>) => void;
};

function ConditionOperandSelector({ name, value, onChange }: ConditionOperandSelectorProps) {
  const [localValue, setLocalValue] = useLocalValue(
    { type: "constant", value: 0 } as ConditionOperand,
    value,
    onChange
  );

  return (
    <div className="flex space-x-2">
      {/* Operand Type 選択 */}
      <div className="w-1/4">
        <Select
          fullWidth
          name={`${name}.type`}
          value={localValue.type}
          onChange={(val) => {
            const type = val as ConditionOperand["type"];
            if (type === "constant") {
              setLocalValue({ type, value: 0 });
            } else {
              setLocalValue({ type, name: "" });
            }
          }}
          options={[
            { value: "constant", label: "数値" },
            { value: "variable", label: "変数" },
          ]}
        />
      </div>
      <div className="flex-grow">
        {localValue.type === "constant" && (
          <NumberConditionOperandSelector value={localValue} onChange={(v) => setLocalValue(v)} />
        )}
        {localValue.type === "variable" && (
          <VariableConditionOperandSelector value={localValue} onChange={(v) => setLocalValue(v)} />
        )}
      </div>
    </div>
  );
}

type NumberConditionOperandSelectorProps = {
  value?: Partial<Extract<ConditionOperand, { type: "constant" }>>;
  onChange: (value: Partial<ConditionOperand>) => void;
};

function NumberConditionOperandSelector({ value, onChange }: NumberConditionOperandSelectorProps) {
  return (
    <NumberInput
      fullWidth
      placeholder="定数（数値）"
      value={value?.value ?? null}
      onChange={(val) => {
        if (val !== null) {
          onChange({
            type: "constant",
            value: val as Extract<ConditionOperand, { type: "constant" }>["value"],
          });
        } else {
          onChange({
            type: "constant",
          });
        }
      }}
    />
  );
}

type VariableConditionOperandSelectorProps = {
  value?: Partial<Extract<ConditionOperand, { type: "variable" }>>;
  onChange: (value: Partial<ConditionOperand>) => void;
};

// VariableConditionOperandSelector の追加
function VariableConditionOperandSelector({
  value,
  onChange,
}: VariableConditionOperandSelectorProps) {
  const variables = useVariables();
  return (
    <Select
      fullWidth
      value={value?.name}
      onChange={(val) => onChange({ type: "variable", name: val })}
      options={variables.map((v) => ({
        value: v.name,
        label: `${v.name} ${v.description ? `(${v.description})` : ""}`,
      }))}
    />
  );
}

export default ConditionOperandSelector;

import Select from "../../components/Select";
import NumberInput from "../../components/NumberInput";
import { useVariables } from "./useVariables";
import { useLocalValue } from "../../hooks/useLocalValue";
import { ConditionOperand } from "../../codegen/dsl/common";
import { useMemo } from "react";

export type ConditionOperandType = "constant" | "scalar_variable" | "array_variable";

export type ConditionOperandSelectorProps = {
  allowedTypes: ConditionOperandType[];
  value?: Partial<ConditionOperand>;
  onChange: (value: Partial<ConditionOperand>) => void;
};

const OPTIONS = [
  { value: "constant" as const, label: "数値" },
  { value: "scalar_variable" as const, label: "変数(スカラー)" },
  { value: "array_variable" as const, label: "変数(配列)" },
];

function toOptionType(
  val: ConditionOperand["type"] | undefined,
  allowedTypes: ConditionOperandType[]
) {
  if (val === "constant") return "constant" as const;
  if (val === "variable") {
    if (allowedTypes.includes("scalar_variable")) return "scalar_variable" as const;
    if (allowedTypes.includes("array_variable")) return "array_variable" as const;
  }
  return "constant" as const;
}

function ConditionOperandSelector({
  allowedTypes,
  value,
  onChange,
}: ConditionOperandSelectorProps) {
  const options = useMemo(() => {
    if (!allowedTypes) return [];
    return OPTIONS.filter((option) => allowedTypes.find((a) => a.startsWith(option.value)));
  }, [allowedTypes]);
  const [localValue, setLocalValue] = useLocalValue(
    { type: "constant", value: 0 } as ConditionOperand,
    value,
    onChange
  );
  const optionType = toOptionType(localValue.type, allowedTypes);

  return (
    <div className="flex space-x-2">
      {/* Operand Type 選択 */}
      <div className="w-1/4">
        <Select
          fullWidth
          value={optionType}
          onChange={(val) => {
            const type = val as ConditionOperandType;
            if (type === "constant") {
              setLocalValue({ type, value: 0 });
            } else {
              setLocalValue({
                type: "variable",
                name: "",
                valueType: type == "array_variable" ? "array" : "scalar",
              });
            }
          }}
          options={options}
        />
      </div>
      <div className="flex-grow">
        {optionType === "constant" && (
          <ConstantConditionOperandSelector
            value={localValue as ConstantConditionOperandSelectorProps["value"]}
            onChange={(v) => setLocalValue(v)}
          />
        )}
        {optionType === "scalar_variable" && (
          <ScalarVariableConditionOperandSelector
            value={localValue as ScalarVariableConditionOperandSelectorProps["value"]}
            onChange={(v) => setLocalValue(v)}
          />
        )}
        {optionType === "array_variable" && (
          <ArrayVariableConditionOperandSelector
            value={localValue as ArrayVariableConditionOperandSelectorProps["value"]}
            onChange={(v) => setLocalValue(v)}
          />
        )}
      </div>
    </div>
  );
}

type ConstantConditionOperandSelectorProps = {
  value?: Partial<Extract<ConditionOperand, { type: "constant" }>>;
  onChange: (value: Partial<ConditionOperand>) => void;
};

function ConstantConditionOperandSelector({
  value,
  onChange,
}: ConstantConditionOperandSelectorProps) {
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

type ScalarVariableConditionOperandSelectorProps = {
  value?: Partial<Extract<ConditionOperand, { type: "variable"; valueType: "scalar" }>>;
  onChange: (value: Partial<ConditionOperand>) => void;
};

function ScalarVariableConditionOperandSelector({
  value,
  onChange,
}: ScalarVariableConditionOperandSelectorProps) {
  const variables = useVariables();
  return (
    <div className="flex space-x-2">
      <Select
        fullWidth
        value={value?.name}
        onChange={(val) => onChange({ ...value, type: "variable", name: val })}
        options={variables.map((v) => ({
          value: v.name,
          label: `${v.name} ${v.description ? `(${v.description})` : ""}`,
        }))}
      />
      <NumberInput
        placeholder="シフト数"
        value={value?.shiftBars?.value}
        onChange={(val) =>
          onChange({
            ...value,
            shiftBars: val === null ? undefined : { type: "constant", value: val },
          })
        }
      />
    </div>
  );
}

type ArrayVariableConditionOperandSelectorProps = {
  value?: Partial<Extract<ConditionOperand, { type: "variable" }>>;
  onChange: (value: Partial<ConditionOperand>) => void;
};

function ArrayVariableConditionOperandSelector({
  value,
  onChange,
}: ArrayVariableConditionOperandSelectorProps) {
  const variables = useVariables().filter((v) => v.expression.type !== "constant");
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

import Select from "../../components/Select";
import NumberInput from "../../components/NumberInput";
import { useVariables } from "./useVariables";
import { useLocalValue } from "../../hooks/useLocalValue";
import { ConditionOperand } from "../../codegen/dsl/common";
import { useMemo } from "react";

export type StrategyConditionOperandType =
  | "constant"
  | "scalar_variable"
  | "array_variable"
  | "scalar_price"
  | "array_price";

export type ConditionOperandSelectorProps = {
  allowedTypes: StrategyConditionOperandType[];
  value?: Partial<ConditionOperand>;
  onChange: (value: Partial<ConditionOperand>) => void;
};

const OPTIONS = [
  { value: "constant" as const, label: "数値" },
  { value: "scalar_variable" as const, label: "変数(スカラー)" },
  { value: "array_variable" as const, label: "変数(配列)" },
  { value: "scalar_price" as const, label: "価格(スカラー)" },
  { value: "array_price" as const, label: "価格(配列)" },
];

function toOptionType(
  val: ConditionOperand["type"] | undefined,
  allowedTypes: StrategyConditionOperandType[]
) {
  if (val === "constant") return "constant" as const;
  if (val === "variable") {
    if (allowedTypes.includes("scalar_variable")) return "scalar_variable" as const;
    if (allowedTypes.includes("array_variable")) return "array_variable" as const;
  }
  if (val === "price") {
    if (allowedTypes.includes("scalar_price")) return "scalar_price" as const;
    if (allowedTypes.includes("array_price")) return "array_price" as const;
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
            const type = val as StrategyConditionOperandType;
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
        {optionType === "scalar_price" && (
          <ScalarPriceConditionOperandSelector
            value={localValue as ScalarPriceConditionOperandSelectorProps["value"]}
            onChange={(v) => setLocalValue(v)}
          />
        )}
        {optionType === "array_price" && (
          <ArrayPriceConditionOperandSelector
            value={localValue as ArrayPriceConditionOperandSelectorProps["value"]}
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

const PRICE_OPTIONS = [
  { value: "open", label: "始値" },
  { value: "high", label: "高値" },
  { value: "low", label: "安値" },
  { value: "close", label: "終値" },
  { value: "volume", label: "出来高" },
];

type ScalarPriceConditionOperandSelectorProps = {
  value?: Partial<Extract<ConditionOperand, { type: "price"; valueType: "scalar" }>>;
  onChange: (value: Partial<ConditionOperand>) => void;
};

function ScalarPriceConditionOperandSelector({
  value,
  onChange,
}: ScalarPriceConditionOperandSelectorProps) {
  return (
    <div className="flex space-x-2">
      <Select
        fullWidth
        value={value?.source}
        onChange={(val) =>
          onChange({
            ...value,
            type: "price",
            source: val as Extract<ConditionOperand, { type: "price" }>["source"],
          })
        }
        options={PRICE_OPTIONS}
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

type ArrayPriceConditionOperandSelectorProps = {
  value?: Partial<Extract<ConditionOperand, { type: "price" }>>;
  onChange: (value: Partial<ConditionOperand>) => void;
};

function ArrayPriceConditionOperandSelector({
  value,
  onChange,
}: ArrayPriceConditionOperandSelectorProps) {
  return (
    <Select
      fullWidth
      value={value?.source}
      onChange={(val) =>
        onChange({
          type: "price",
          source: val as Extract<ConditionOperand, { type: "price" }>["source"],
        })
      }
      options={PRICE_OPTIONS}
    />
  );
}

export default ConditionOperandSelector;

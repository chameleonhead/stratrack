import Select from "../../../components/Select";
import NumberInput from "../../../components/NumberInput";
import ShiftBarsEditor from "./ShiftBarsEditor";
import { useVariables } from "./useVariables";
import { useLocalValue } from "../../../hooks/useLocalValue";
import { ConditionOperand } from "../../../codegen/dsl/common";
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

function toOptionType(val: ConditionOperand | undefined) {
  if (val?.type === "constant") return "constant" as const;
  if (val?.type === "variable") return "array_variable" as const;
  if (val?.type === "price") return "array_price" as const;
  if (val?.type === "bar_shift" && val?.source.type === "variable")
    return "scalar_variable" as const;
  if (val?.type === "bar_shift" && val?.source.type === "price") return "scalar_price" as const;
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
  const optionType = toOptionType(localValue as ConditionOperand);

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
            } else if (type === "scalar_variable") {
              setLocalValue({
                type: "bar_shift",
                source: { type: "variable", name: "" },
              });
            } else if (type === "array_variable") {
              setLocalValue({ type: "variable", name: "" });
            } else if (type === "scalar_price") {
              setLocalValue({
                type: "scalar_price",
                source: "close",
              });
            } else if (type === "array_price") {
              setLocalValue({
                type: "bar_shift",
                source: { type: "price", source: "close" },
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
  value?: Partial<Extract<ConditionOperand, { type: "bar_shift" }>>;
  onChange: (value: Partial<ConditionOperand>) => void;
};

function ScalarVariableConditionOperandSelector({
  value,
  onChange,
}: ScalarVariableConditionOperandSelectorProps) {
  const variables = useVariables();
  const source = value?.source as Extract<
    Extract<ConditionOperand, { type: "bar_shift" }>["source"],
    { type: "variable" }
  >;
  const shiftbars = value?.shiftBars as Extract<
    Extract<ConditionOperand, { type: "bar_shift" }>["shiftBars"],
    { type: "constant" }
  >;
  return (
    <div className="flex space-x-2">
      <Select
        fullWidth
        value={source?.name}
        onChange={(val) =>
          onChange({
            ...value,
            type: "bar_shift",
            source: { type: "variable", name: val },
          })
        }
        options={variables.map((v) => ({
          value: v.name,
          label: `${v.name} ${v.description ? `(${v.description})` : ""}`,
        }))}
      />
      <ShiftBarsEditor
        value={value?.shiftBars}
        onChange={(val) =>
          onChange({
            ...value,
            shiftBars: val,
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
  value?: Partial<Extract<ConditionOperand, { type: "bar_shift" }>>;
  onChange: (value: Partial<ConditionOperand>) => void;
};

function ScalarPriceConditionOperandSelector({
  value,
  onChange,
}: ScalarPriceConditionOperandSelectorProps) {
  const source = value?.source as Extract<
    Extract<ConditionOperand, { type: "bar_shift" }>["source"],
    { type: "price" }
  >;
  const shiftbars = value?.shiftBars as Extract<
    Extract<ConditionOperand, { type: "bar_shift" }>["shiftBars"],
    { type: "constant" }
  >;
  return (
    <div className="flex space-x-2">
      <Select
        fullWidth
        value={source?.source}
        onChange={(val) =>
          onChange({
            ...value,
            type: "bar_shift",
            source: { type: "variable", name: val },
          })
        }
        options={PRICE_OPTIONS}
      />
      <ShiftBarsEditor
        value={value?.shiftBars}
        onChange={(val) =>
          onChange({
            ...value,
            shiftBars: val,
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

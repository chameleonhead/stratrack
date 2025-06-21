import React from "react";
import Select from "../../../components/Select";
import NumberInput from "../../../components/NumberInput";
import { PermanentVariableExpression } from "../../../codegen/dsl/common";
import { useLocalValue } from "../../../hooks/useLocalValue";
import { useVariables } from "./useVariables";

export type ShiftBarsEditorProps = {
  value?: PermanentVariableExpression;
  onChange?: (value: PermanentVariableExpression | undefined) => void;
  label?: string;
};

const TYPE_OPTIONS = [
  { value: "constant", label: "定数" },
  { value: "variable", label: "変数" },
];

const ShiftBarsEditor: React.FC<ShiftBarsEditorProps> = ({ value, onChange, label }) => {
  const variables = useVariables();
  const [local, setLocalValue] = useLocalValue<PermanentVariableExpression>(
    { type: "constant", value: 0 },
    value,
    onChange
  );

  return (
    <div className="flex space-x-2 items-end">
      <div className="w-1/4">
        <Select
          fullWidth
          label={label}
          value={local.type}
          onChange={(val) => {
            const type = val as PermanentVariableExpression["type"] | "variable";
            if (type === "constant") {
              setLocalValue({ type: "constant", value: 0 });
            } else {
              setLocalValue({ type: "variable", name: "" } as PermanentVariableExpression);
            }
          }}
          options={TYPE_OPTIONS}
        />
      </div>
      <div className="flex-grow">
        {local.type === "constant" && (
          <NumberInput
            fullWidth
            placeholder="シフト数"
            value={local.value}
            onChange={(val) =>
              setLocalValue(
                val === null ? { type: "constant", value: 0 } : { type: "constant", value: val }
              )
            }
          />
        )}
        {local.type === "variable" && (
          <Select
            fullWidth
            value={local.name}
            onChange={(val) =>
              setLocalValue({ type: "variable", name: val })
            }
            options={variables.map((v) => ({
              value: v.name,
              label: `${v.name}${v.description ? ` (${v.description})` : ""}`,
            }))}
          />
        )}
      </div>
    </div>
  );
};

export default ShiftBarsEditor;

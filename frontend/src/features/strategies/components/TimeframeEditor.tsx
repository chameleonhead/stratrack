import React from "react";
import Select from "../../../components/Select";
import NumberInput from "../../../components/NumberInput";
import { TimeframeExpression } from "../../../codegen/dsl/common";
import { useLocalValue } from "../../../hooks/useLocalValue";
import { useVariables } from "./useVariables";

export type TimeframeEditorProps = {
  value?: TimeframeExpression;
  onChange?: (value: TimeframeExpression | undefined) => void;
  label?: string;
};

const TYPE_OPTIONS = [
  { value: "constant", label: "固定" },
  { value: "variable", label: "変数" },
  { value: "higher_timeframe", label: "上位足" },
];

const TIMEFRAME_OPTIONS = [
  { value: "1m", label: "1分" },
  { value: "5m", label: "5分" },
  { value: "15m", label: "15分" },
  { value: "1h", label: "1時間" },
  { value: "4h", label: "4時間" },
  { value: "1d", label: "1日" },
];

const TimeframeEditor: React.FC<TimeframeEditorProps> = ({ value, onChange, label }) => {
  const variables = useVariables().filter((v) => v.dataType === "timeframe");
  const [local, setLocalValue] = useLocalValue<TimeframeExpression>(
    { type: "constant", value: "1m" },
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
            const type = val as TimeframeExpression["type"];
            if (type === "constant") {
              setLocalValue({ type: "constant", value: "1m" });
            } else if (type === "variable") {
              setLocalValue({ type: "variable", name: variables[0]?.name || "" });
            } else {
              setLocalValue({ type: "higher_timeframe", level: 1 });
            }
          }}
          options={TYPE_OPTIONS}
        />
      </div>
      <div className="flex-grow">
        {local.type === "constant" && (
          <Select
            fullWidth
            value={local.value}
            onChange={(val) => setLocalValue({ type: "constant", value: val })}
            options={TIMEFRAME_OPTIONS}
          />
        )}
        {local.type === "variable" && (
          <Select
            fullWidth
            value={local.name}
            onChange={(val) => setLocalValue({ type: "variable", name: val })}
            options={variables.map((v) => ({
              value: v.name,
              label: `${v.name}${v.description ? ` (${v.description})` : ""}`,
            }))}
          />
        )}
        {local.type === "higher_timeframe" && (
          <NumberInput
            fullWidth
            value={local.level}
            onChange={(val) => setLocalValue({ type: "higher_timeframe", level: val || 1 })}
            label="上位足"
          />
        )}
      </div>
    </div>
  );
};

export default TimeframeEditor;

import React, { useEffect, useState } from "react";
import Select from "../../components/Select";
import { Condition } from "../types";
import ComparisonConditionSelector from "./ComparisonConditionSelector";
import CrossConditionSelector from "./CrossConditionSelector";
import StateConditionSelector from "./StateConditionSelector";
import ChangeConditionSelector from "./ChangeConditionSelector";
import GroupConditionSelector from "./GroupConditionSelector";

export type ConditionRowProps = {
  value: Condition | undefined;
  onChange: (value: Condition | undefined) => void;
};

const CONDITION_OPTIONS = [
  { value: "comparison", label: "比較条件" },
  { value: "cross", label: "クロス条件" },
  { value: "state", label: "状態条件" },
  { value: "change", label: "変化条件" },
  { value: "group", label: "グループ条件" },
];

const ConditionRow: React.FC<ConditionRowProps> = ({ value, onChange }) => {
  const [type, setType] = useState<Condition["type"]>(
    value?.type || "comparison"
  );
  const [condition, setCondition] = useState<Condition | undefined>(
    value || {
      type: "comparison",
      operator: ">",
      left: { type: "number", value: 0 },
      right: { type: "number", value: 0 },
    }
  );

  useEffect(() => {
    if (condition) {
      onChange(condition);
    } else {
      onChange(undefined);
    }
  }, [onChange, condition]);

  const handleTypeChange = (newType: Condition["type"]) => {
    setType(newType);
    switch (newType) {
      case "comparison":
        setCondition({
          type: "comparison",
          operator: ">",
          left: { type: "number", value: 0 },
          right: { type: "number", value: 0 },
        });
        break;
      case "cross":
        setCondition({
          type: "cross",
          direction: "cross_over",
          left: { type: "number", value: 0 },
          right: { type: "number", value: 0 },
        });
        break;
      case "state":
        setCondition({
          type: "state",
          operand: { type: "number", value: 0 },
          state: "rising",
        });
        break;
      case "change":
        setCondition({
          type: "change",
          change: "to_true",
          condition: {
            type: "comparison",
            operator: ">",
            left: { type: "number", value: 0 },
            right: { type: "number", value: 0 },
          },
        });
        break;
      case "group":
        setCondition({
          type: "group",
          operator: "and",
          conditions: [],
        });
        break;
    }
  };

  return (
    <div className="space-y-2 border p-4 rounded">
      <Select
        value={type}
        onChange={(val) => handleTypeChange(val as Condition["type"])}
        options={CONDITION_OPTIONS}
      />

      {type === "comparison" &&
        (typeof value === "undefined" || value.type === "comparison") && (
          <ComparisonConditionSelector value={value} onChange={onChange} />
        )}
      {type === "cross" &&
        (typeof value === "undefined" || value.type === "cross") && (
          <CrossConditionSelector value={value} onChange={onChange} />
        )}
      {type === "state" &&
        (typeof value === "undefined" || value.type === "state") && (
          <StateConditionSelector value={value} onChange={onChange} />
        )}
      {type === "change" &&
        (typeof value === "undefined" || value.type === "change") && (
          <ChangeConditionSelector value={value} onChange={onChange} />
        )}
      {type === "group" &&
        (typeof value === "undefined" || value.type === "group") && (
          <GroupConditionSelector value={value} onChange={onChange} />
        )}
    </div>
  );
};

export default ConditionRow;

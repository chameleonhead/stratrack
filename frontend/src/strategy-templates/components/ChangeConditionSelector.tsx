import React, { useEffect, useState } from "react";
import { ChangeCondition, Condition } from "../types";
import ConditionRow from "./ConditionRow";
import Select from "../../components/Select";

export type ChangeConditionSelectorProps = {
  value: ChangeCondition | undefined;
  onChange: (value: ChangeCondition | undefined) => void;
};

const CHANGE_OPTIONS = [
  { value: "to_true", label: "false → true への変化" },
  { value: "to_false", label: "true → false への変化" },
];

const ChangeConditionSelector: React.FC<ChangeConditionSelectorProps> = ({
  value,
  onChange,
}) => {
  const [condition, setCondition] = useState<Condition | undefined>(
    value?.condition
  );
  const [change, setChange] = useState<ChangeCondition["change"]>(
    value?.change || "to_true"
  );

  useEffect(() => {
    if (condition && change) {
      onChange({ type: "change", condition, change });
    } else {
      onChange(undefined);
    }
  }, [onChange, condition, change]);

  return (
    <div className="space-y-4">
      <Select
        value={change}
        onChange={(val) => setChange(val as ChangeCondition["change"])}
        options={CHANGE_OPTIONS}
      />

      <ConditionRow value={condition} onChange={setCondition} />
    </div>
  );
};

export default ChangeConditionSelector;

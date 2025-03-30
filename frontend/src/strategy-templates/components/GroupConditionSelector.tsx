import React, { useEffect, useState } from "react";
import { Condition, GroupCondition } from "../types";
import ConditionBuilder from "./ConditionBuilder";
import Select from "../../components/Select";

export type GroupConditionSelectorProps = {
  value: GroupCondition | undefined;
  onChange: (value: GroupCondition | undefined) => void;
};

const LOGIC_OPTIONS = [
  { value: "and", label: "すべて満たす（AND）" },
  { value: "or", label: "いずれか満たす（OR）" },
];

const GroupConditionSelector: React.FC<GroupConditionSelectorProps> = ({
  value,
  onChange,
}) => {
  const [conditions, setConditions] = useState<(Condition | undefined)[]>(
    value?.conditions || []
  );
  const [operator, setOperator] = useState<GroupCondition["operator"]>(
    value?.operator || "and"
  );

  useEffect(() => {
    if (operator && conditions.every(Boolean)) {
      onChange({
        type: "group",
        operator,
        conditions: conditions as Condition[],
      });
    } else {
      onChange(undefined);
    }
  }, [onChange, conditions, operator]);

  return (
    <div className="space-y-4">
      <Select
        value={operator}
        onChange={(val) => setOperator(val as GroupCondition["operator"])}
        options={LOGIC_OPTIONS}
      />

      <ConditionBuilder value={conditions} onChange={setConditions} />
    </div>
  );
};

export default GroupConditionSelector;

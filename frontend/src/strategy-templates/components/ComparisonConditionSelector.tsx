import React, { useEffect, useState } from "react";
import { ComparisonCondition, Operand } from "../types";
import OperandSelector from "./OperandSelector";
import Select from "../../components/Select";

export type ComparisonConditionSelectorProps = {
  value: ComparisonCondition | undefined;
  onChange: (value: ComparisonCondition | undefined) => void;
};

const COMPARISON_OPERATORS = [
  { value: ">", label: ">" },
  { value: "<", label: "<" },
  { value: ">=", label: ">=" },
  { value: "<=", label: "<=" },
  { value: "==", label: "==" },
  { value: "!=", label: "!=" },
];

const ComparisonConditionSelector: React.FC<
  ComparisonConditionSelectorProps
> = ({ value, onChange }) => {
  const [left, setLeft] = useState<Operand | undefined>(value?.left);
  const [right, setRight] = useState<Operand | undefined>(value?.right);
  const [operator, setOperator] = useState<ComparisonCondition["operator"]>(
    value?.operator || ">"
  );

  useEffect(() => {
    if (left && right && operator) {
      onChange({ type: "comparison", left, right, operator });
    } else {
      onChange(undefined);
    }
  }, [onChange, left, right, operator]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
      <OperandSelector value={left} onChange={setLeft} />

      <Select
        value={operator}
        onChange={(val) => setOperator(val as ComparisonCondition["operator"])}
        options={COMPARISON_OPERATORS}
      />

      <OperandSelector value={right} onChange={setRight} />
    </div>
  );
};

export default ComparisonConditionSelector;

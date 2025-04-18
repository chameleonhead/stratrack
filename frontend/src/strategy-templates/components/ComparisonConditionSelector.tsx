import OperandSelector from "./ConditionOperandSelector";
import Select from "../../components/Select";
import { useLocalValue } from "../../hooks/useLocalValue";
import { ComparisonCondition } from "../../codegen/dsl/common";

export type ComparisonConditionSelectorProps = {
  name?: string;
  value: Partial<ComparisonCondition>;
  onChange: (value: Partial<ComparisonCondition>) => void;
};

const COMPARISON_OPERATORS = [
  { value: ">", label: ">" },
  { value: "<", label: "<" },
  { value: ">=", label: ">=" },
  { value: "<=", label: "<=" },
  { value: "==", label: "==" },
  { value: "!=", label: "!=" },
];

function ComparisonConditionSelector({ value, onChange }: ComparisonConditionSelectorProps) {
  const [condtion, setCondition] = useLocalValue({ type: "comparison" }, value, onChange);

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
      <div className="col-span-1 md:col-span-2">
        <OperandSelector
          value={condtion.left}
          onChange={(left) =>
            setCondition({
              ...condtion,
              left: left as ComparisonCondition["left"],
            })
          }
        />
      </div>

      <div className="col-span-1 md:col-span-1">
        <Select
          fullWidth
          value={condtion.operator}
          onChange={(operator) =>
            setCondition({
              ...condtion,
              operator: operator as ComparisonCondition["operator"],
            })
          }
          options={COMPARISON_OPERATORS}
        />
      </div>

      <div className="col-span-1 md:col-span-2">
        <OperandSelector
          value={condtion.right}
          onChange={(right) =>
            setCondition({
              ...condtion,
              right: right as ComparisonCondition["right"],
            })
          }
        />
      </div>
    </div>
  );
}

export default ComparisonConditionSelector;

import OperandSelector from "./StrategyConditionOperandSelector";
import Select from "../../../components/Select";
import { useLocalValue } from "../../../hooks/useLocalValue";
import { StrategyCondition } from "../../../codegen/dsl/strategy";

type StrategyComparisonCondition = Extract<StrategyCondition, { type: "comparison" }>;

export type StrategyComparisonConditionSelectorProps = {
  value: Partial<StrategyComparisonCondition>;
  onChange: (value: Partial<StrategyComparisonCondition>) => void;
};

const COMPARISON_OPERATORS = [
  { value: ">", label: ">" },
  { value: "<", label: "<" },
  { value: ">=", label: ">=" },
  { value: "<=", label: "<=" },
  { value: "==", label: "==" },
  { value: "!=", label: "!=" },
];

function StrategyComparisonConditionSelector({
  value,
  onChange,
}: StrategyComparisonConditionSelectorProps) {
  const [condtion, setCondition] = useLocalValue({ type: "comparison" }, value, onChange);

  return (
    <div className="grid grid-cols-2 xl:grid-cols-11 gap-4 items-center">
      <div className="col-span-2 xl:col-span-5">
        <OperandSelector
          allowedTypes={["constant", "scalar_variable"]}
          value={condtion.left}
          onChange={(left) =>
            setCondition({
              ...condtion,
              left: left as StrategyComparisonCondition["left"],
            })
          }
        />
      </div>

      <div className="col-span-2 xl:col-span-1">
        <Select
          fullWidth
          value={condtion.operator}
          onChange={(operator) =>
            setCondition({
              ...condtion,
              operator: operator as StrategyComparisonCondition["operator"],
            })
          }
          options={COMPARISON_OPERATORS}
        />
      </div>

      <div className="col-span-2 xl:col-span-5">
        <OperandSelector
          allowedTypes={["constant", "scalar_variable"]}
          value={condtion.right}
          onChange={(right) =>
            setCondition({
              ...condtion,
              right: right as StrategyComparisonCondition["right"],
            })
          }
        />
      </div>
    </div>
  );
}

export default StrategyComparisonConditionSelector;

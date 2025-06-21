import { useCallback, useMemo } from "react";
import Select from "../../../components/Select";
import StrategyComparisonConditionSelector from "./StrategyComparisonConditionSelector";
import StrategyContinueConditionSelector from "./StrategyContinueConditionSelector";
import StrategyCrossConditionSelector from "./StrategyCrossConditionSelector";
import StrategyStateConditionSelector from "./StrategyStateConditionSelector";
import StrategyChangeConditionSelector from "./StrategyChangeConditionSelector";
import StrategyGroupConditionSelector from "./StrategyGroupConditionSelector";
import { useLocalValue } from "../../../hooks/useLocalValue";
import Button from "../../../components/Button";
import { StrategyCondition } from "../../../codegen/dsl/strategy";

export type StrategyConditionBuilderProps = {
  name?: string;
  value?: Partial<StrategyCondition>;
  onChange: (value: Partial<StrategyCondition>) => void;
  onDelete?: () => void;
};

const CONDITION_OPTIONS = [
  { value: "comparison", label: "比較条件" },
  { value: "cross", label: "クロス条件" },
  { value: "state", label: "状態条件" },
  { value: "continue", label: "継続条件" },
  { value: "change", label: "変化条件" },
  { value: "group", label: "グループ条件" },
];

function StrategyConditionBuilder({
  name,
  value,
  onChange,
  onDelete,
}: StrategyConditionBuilderProps) {
  const [condition, setCondition] = useLocalValue(
    {
      type: "comparison",
      operator: ">",
      left: { type: "constant", value: 0 },
      right: { type: "constant", value: 0 },
    },
    value,
    onChange
  );

  const handleTypeChange = useCallback(
    (newType: StrategyCondition["type"]) => {
      if (condition.type === newType) return;
      switch (newType) {
        case "comparison":
          setCondition({
            type: "comparison",
            operator: ">",
            left: { type: "constant", value: 0 },
            right: { type: "constant", value: 0 },
          });
          break;
        case "cross":
          setCondition({
            type: "cross",
            direction: "cross_over",
            left: { type: "constant", value: 0 },
            right: { type: "constant", value: 0 },
          });
          break;
        case "state":
          setCondition({
            type: "state",
            operand: { type: "variable", name: "" },
            state: "rising",
          });
          break;
        case "continue":
          setCondition({
            type: "continue",
            condition: {
              type: "comparison",
              operator: ">",
              left: { type: "constant", value: 0 },
              right: { type: "constant", value: 0 },
            },
            continue: "true",
          });
          break;
        case "change":
          setCondition({
            type: "change",
            change: "to_true",
            condition: {
              type: "comparison",
              operator: ">",
              left: { type: "constant", value: 0 },
              right: { type: "constant", value: 0 },
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
    },
    [condition.type, setCondition]
  );

  return (
    <div className="space-y-2 border p-4 rounded">
      <div className="flex justify-between">
        <Select
          name={`${name}.type`}
          value={condition.type}
          onChange={handleTypeChange as (value: string) => void}
          options={CONDITION_OPTIONS}
        />
        {onDelete ? (
          <Button onClick={onDelete} variant="danger">
            ×
          </Button>
        ) : null}
      </div>
      {useMemo(() => {
        switch (condition.type) {
          case "comparison":
            return <StrategyComparisonConditionSelector value={condition} onChange={setCondition} />;
          case "cross":
            return <StrategyCrossConditionSelector value={condition} onChange={setCondition} />;
          case "state":
            return <StrategyStateConditionSelector value={condition} onChange={setCondition} />;
          case "continue":
            return <StrategyContinueConditionSelector value={condition} onChange={setCondition} />;
          case "change":
            return <StrategyChangeConditionSelector value={condition} onChange={setCondition} />;
          case "group":
            return <StrategyGroupConditionSelector value={condition} onChange={setCondition} />;
        }
        return null;
      }, [condition, setCondition])}
    </div>
  );
}

export default StrategyConditionBuilder;

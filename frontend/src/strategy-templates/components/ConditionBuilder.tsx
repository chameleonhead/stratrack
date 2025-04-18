import Select from "../../components/Select";
import ComparisonConditionSelector from "./ComparisonConditionSelector";
import ContinueConditionSelector from "./ContinueConditionSelector";
import CrossConditionSelector from "./CrossConditionSelector";
import StateConditionSelector from "./StateConditionSelector";
import ChangeConditionSelector from "./ChangeConditionSelector";
import GroupConditionSelector from "./GroupConditionSelector";
import { useLocalValue } from "../../hooks/useLocalValue";
import Button from "../../components/Button";
import { Condition } from "../../codegen/dsl/common";

export type ConditionBuilderProps = {
  name?: string;
  value?: Partial<Condition>;
  onChange: (value: Partial<Condition>) => void;
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

function ConditionBuilder({ name, value, onChange, onDelete }: ConditionBuilderProps) {
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

  const handleTypeChange = (newType: Condition["type"]) => {
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
          operand: { type: "variable", name: "", valueType: "array" },
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
  };

  return (
    <div className="space-y-2 border p-4 rounded">
      <div className="flex justify-between">
        <Select
          name={`${name}.type`}
          value={condition.type}
          onChange={(val) => handleTypeChange(val as Condition["type"])}
          options={CONDITION_OPTIONS}
        />
        {onDelete ? (
          <Button onClick={onDelete} variant="danger">
            ×
          </Button>
        ) : null}
      </div>

      {condition.type === "comparison" && (
        <ComparisonConditionSelector name={name} value={condition} onChange={onChange} />
      )}
      {condition.type === "cross" && (
        <CrossConditionSelector name={name} value={condition} onChange={onChange} />
      )}
      {condition.type === "state" && (
        <StateConditionSelector name={name} value={condition} onChange={onChange} />
      )}
      {condition.type === "continue" && (
        <ContinueConditionSelector name={name} value={condition} onChange={onChange} />
      )}
      {condition.type === "change" && (
        <ChangeConditionSelector name={name} value={condition} onChange={onChange} />
      )}
      {condition.type === "group" && (
        <GroupConditionSelector name={name} value={condition} onChange={onChange} />
      )}
    </div>
  );
}

export default ConditionBuilder;

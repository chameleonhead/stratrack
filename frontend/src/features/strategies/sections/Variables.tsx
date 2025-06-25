import Button from "../../../components/Button";
import Input from "../../../components/Input";
import Select from "../../../components/Select";
import TimeframeEditor from "../components/TimeframeEditor";
import {
  StrategyTemplate,
  StrategyVariableDefinition,
  StrategyVariableExpression,
} from "../../../codegen/dsl/strategy";
import { VariableDataType, TimeframeExpression } from "../../../codegen/dsl/common";
import { useLocalValue } from "../../../hooks/useLocalValue";
import VariableExpressionEditor from "../components/VariableExpressionEditor";

export type VariablesProps = {
  value?: Partial<StrategyTemplate>;
  onChange?: (value: Partial<StrategyTemplate>) => void;
};

function Variables({ value, onChange }: VariablesProps) {
  const [localValue, setLocalValue] = useLocalValue<Partial<StrategyTemplate>>(
    { variables: [] },
    value,
    onChange
  );

  const DATA_TYPE_OPTIONS = [
    { value: "string", label: "文字列" },
    { value: "number", label: "数値" },
    { value: "series", label: "数値配列" },
    { value: "timeframe", label: "時間足" },
  ];

  const handleAdd = () => {
    setLocalValue({
      ...localValue,
      variables: [
        ...(localValue.variables || []),
        {
          name: "",
          dataType: "number" as VariableDataType,
          timeframe: undefined,
          expression: { type: "constant", value: 0 },
        },
      ],
    });
  };

  const handleUpdate = (index: number, value: StrategyVariableDefinition) => {
    const updatedVariables = [...(localValue.variables || [])];
    updatedVariables[index] = value;
    setLocalValue({ ...localValue, variables: updatedVariables });
  };

  return (
    <section id="basic-info" className="space-y-4">
      <h2>変数定義</h2>
      {localValue?.variables?.map((variable, index) => (
        <div key={index} className="space-y-4 border p-4 rounded">
          <Input
            fullWidth
            label="変数名"
            value={variable.name || ""}
            onChange={(value) =>
              handleUpdate(index, {
                ...variable,
                name: value,
              })
            }
            required
          />
          <div className="grid grid-cols-2 gap-2">
            <Select
              fullWidth
              label="データ型"
              value={variable.dataType || "number"}
              onChange={(val) =>
                handleUpdate(index, {
                  ...variable,
                  dataType: val as VariableDataType,
                })
              }
              options={DATA_TYPE_OPTIONS}
            />
            <TimeframeEditor
              label="時間足"
              value={variable.timeframe as TimeframeExpression}
              onChange={(val) =>
                handleUpdate(index, {
                  ...variable,
                  timeframe: val,
                })
              }
            />
          </div>
          <VariableExpressionEditor
            value={variable.expression}
            onChange={(value) =>
              handleUpdate(index, {
                ...variable,
                expression: value as StrategyVariableExpression,
              })
            }
          />
          <Input
            fullWidth
            label="説明"
            value={variable.description || ""}
            onChange={(value) =>
              handleUpdate(index, {
                ...variable,
                description: value,
              })
            }
          />
        </div>
      ))}
      <Button type="button" onClick={handleAdd}>
        変数を追加
      </Button>
    </section>
  );
}

export default Variables;

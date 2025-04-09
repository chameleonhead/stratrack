import Button from "../../components/Button";
import Input from "../../components/Input";
import { useLocalValue } from "../../hooks/useLocalValue";
import VariableExpressionEditor from "../components/VariableExpressionEditor";
import { VariableDefinition, VariableExpression } from "../types";

function Variables() {
  const [localValue, setLocalValue] = useLocalValue<VariableDefinition[]>(
    [],
    undefined,
    undefined
  );

  const handleAdd = () => {
    setLocalValue([
      ...localValue,
      { name: "", expression: { type: "constant", value: 0 } },
    ]);
  };

  const handleUpdate = (index: number, value: VariableDefinition) => {
    const newVariables = [...localValue];
    newVariables[index] = value;
    setLocalValue(newVariables);
  };

  return (
    <section id="basic-info" className="space-y-4">
      <h2>変数定義</h2>
      {localValue.map((variable, index) => (
        <div key={index} className="space-y-4 border p-4 rounded">
          <Input label="変数名" name={`variables[${index}].name`} required />
          <VariableExpressionEditor
            value={variable.expression}
            onChange={(value) =>
              handleUpdate(index, {
                ...variable,
                expression: value as VariableExpression,
              })
            }
          />
          <Input label="説明" name={`variables[${index}].description`} />
        </div>
      ))}
      <Button type="button" onClick={handleAdd}>
        変数を追加
      </Button>
    </section>
  );
}

export default Variables;

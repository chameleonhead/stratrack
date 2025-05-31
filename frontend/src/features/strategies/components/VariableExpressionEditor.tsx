import React, { useState } from "react";
import Select from "../../../components/Select";
import { StrategyVariableExpression } from "../../../codegen/dsl/strategy";

export type VariableExpressionEditorProps = {
  name?: string;
  value?: StrategyVariableExpression;
  onChange: (value: StrategyVariableExpression | undefined) => void;
};

const EXPRESSION_TYPES = [
  { value: "price", label: "価格" },
  { value: "indicator", label: "インジケーター" },
  { value: "constant", label: "定数" },
  { value: "variable", label: "変数" },
  { value: "binary_op", label: "計算式（四則演算）" },
  { value: "unary_op", label: "単項演算" },
  { value: "ternary", label: "三項演算（if文）" },
];

const VariableExpressionEditor: React.FC<VariableExpressionEditorProps> = ({
  name,
  value,
  onChange,
}) => {
  const [type, setType] = useState<StrategyVariableExpression["type"]>(value?.type ?? "constant");

  const handleTypeChange = (t: StrategyVariableExpression["type"]) => {
    setType(t);
    // 初期値を入れる（必要に応じて変更）
    switch (t) {
      case "constant":
        onChange({ type: "constant", value: 0 });
        break;
      case "bar_shift":
        onChange({
          type: "bar_shift",
          source: { type: "variable", name: "" },
        });
        break;
      case "scalar_price":
        onChange({ type: "scalar_price", source: "close" });
        break;
      case "indicator":
        onChange({ type: "indicator", name: "", params: [], lineName: "" });
        break;
      case "binary_op":
        onChange({
          type: "binary_op",
          operator: "+",
          left: { type: "constant", value: 0 },
          right: { type: "constant", value: 0 },
        });
        break;
      case "unary_op":
        onChange({
          type: "unary_op",
          operator: "-",
          operand: { type: "constant", value: 0 },
        });
        break;
      case "ternary":
        onChange({
          type: "ternary",
          condition: {
            type: "comparison",
            operator: ">",
            left: { type: "constant", value: 0 },
            right: { type: "constant", value: 0 },
          },
          trueExpr: { type: "constant", value: 1 },
          falseExpr: { type: "constant", value: 0 },
        });
        break;
    }
  };

  return (
    <div className="space-y-2">
      <Select
        label="式の種類"
        name={`${name}.type`}
        value={type}
        onChange={(val) => handleTypeChange(val as StrategyVariableExpression["type"])}
        options={EXPRESSION_TYPES}
      />

      {/* TODO: 各種入力フィールドを条件ごとに分けて表示 */}
      <pre className="text-xs bg-gray-100 p-2 rounded">{JSON.stringify(value, null, 2)}</pre>
    </div>
  );
};

export default VariableExpressionEditor;

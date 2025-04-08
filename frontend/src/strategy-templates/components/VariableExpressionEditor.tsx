import React, { useState } from "react";
import { VariableExpression } from "../types";
import Select from "../../components/Select";

export type VariableExpressionEditorProps = {
  value?: VariableExpression;
  onChange: (value: VariableExpression | undefined) => void;
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
  value,
  onChange,
}) => {
  const [type, setType] = useState<VariableExpression["type"]>(
    value?.type ?? "constant"
  );

  const handleTypeChange = (t: VariableExpression["type"]) => {
    setType(t);
    // 初期値を入れる（必要に応じて変更）
    switch (t) {
      case "constant":
        onChange({ type: "constant", value: 0 });
        break;
      case "variable":
        onChange({ type: "variable", name: "" });
        break;
      case "price":
        onChange({ type: "price", source: "close" });
        break;
      case "indicator":
        onChange({ type: "indicator", name: "RSI" });
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
        value={type}
        onChange={(val) => handleTypeChange(val as VariableExpression["type"])}
        options={EXPRESSION_TYPES}
      />

      {/* TODO: 各種入力フィールドを条件ごとに分けて表示 */}
      <pre className="text-xs bg-gray-100 p-2 rounded">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
};

export default VariableExpressionEditor;

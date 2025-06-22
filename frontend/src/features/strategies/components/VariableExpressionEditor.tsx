import React, { useMemo } from "react";
import Select from "../../../components/Select";
import NumberInput from "../../../components/NumberInput";
import ShiftBarsEditor from "./ShiftBarsEditor";
import { StrategyVariableExpression, StrategyCondition } from "../../../codegen/dsl/strategy";
import { useLocalValue } from "../../../hooks/useLocalValue";
import { useVariables } from "./useVariables";
import { useIndicatorList } from "../../indicators/IndicatorProvider";
import StrategyConditionBuilder from "./StrategyConditionBuilder";

export type VariableExpressionEditorProps = {
  name?: string;
  value?: StrategyVariableExpression;
  onChange: (value: StrategyVariableExpression | undefined) => void;
};

const EXPRESSION_TYPES = [
  { value: "constant", label: "定数" },
  { value: "bar_shift", label: "変数" },
  { value: "scalar_price", label: "価格" },
  { value: "indicator", label: "インジケーター" },
  { value: "binary_op", label: "計算式（四則演算）" },
  { value: "unary_op", label: "単項演算" },
  { value: "ternary", label: "三項演算（if文）" },
];

const PRICE_OPTIONS = [
  { value: "open", label: "始値" },
  { value: "high", label: "高値" },
  { value: "low", label: "安値" },
  { value: "close", label: "終値" },
  { value: "volume", label: "出来高" },
];

const BINARY_OPERATORS = [
  { value: "+", label: "+" },
  { value: "-", label: "-" },
  { value: "*", label: "*" },
  { value: "/", label: "/" },
  { value: "max", label: "max" },
  { value: "min", label: "min" },
];

const UNARY_OPERATORS = [
  { value: "-", label: "-" },
  { value: "abs", label: "abs" },
];

const VariableExpressionEditor: React.FC<VariableExpressionEditorProps> = ({
  name,
  value,
  onChange,
}) => {
  const variables = useVariables();
  const indicators = useIndicatorList();
  const [expr, setExpr] = useLocalValue<StrategyVariableExpression>(
    { type: "constant", value: 0 },
    value,
    onChange
  );

  const indicatorName = expr.type === "indicator" ? expr.name : "";
  const lineOptions = useMemo(() => {
    const indicator = indicators.find((i) => i.name === indicatorName);
    return (indicator?.lines || []).map((l) => ({
      value: l.name,
      label: l.label,
    }));
  }, [indicators, indicatorName]);

  const handleTypeChange = (t: StrategyVariableExpression["type"]) => {
    switch (t) {
      case "constant":
        setExpr({ type: "constant", value: 0 });
        break;
      case "bar_shift":
        setExpr({
          type: "bar_shift",
          source: { type: "variable", name: "" },
        });
        break;
      case "scalar_price":
        setExpr({ type: "scalar_price", source: "close" });
        break;
      case "indicator":
        setExpr({ type: "indicator", name: "", params: [], lineName: "" });
        break;
      case "binary_op":
        setExpr({
          type: "binary_op",
          operator: "+",
          left: { type: "constant", value: 0 },
          right: { type: "constant", value: 0 },
        });
        break;
      case "unary_op":
        setExpr({
          type: "unary_op",
          operator: "-",
          operand: { type: "constant", value: 0 },
        });
        break;
      case "ternary":
        setExpr({
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
        value={expr.type}
        onChange={(val) => handleTypeChange(val as StrategyVariableExpression["type"])}
        options={EXPRESSION_TYPES}
      />

      {expr.type === "constant" && (
        <NumberInput
          fullWidth
          label="値"
          value={expr.value}
          onChange={(val) => setExpr({ type: "constant", value: val ?? 0 })}
        />
      )}

      {expr.type === "bar_shift" && (
        <div className="space-y-2">
          <Select
            fullWidth
            label="変数"
            value={expr.source.type === "variable" ? expr.source.name : ""}
            onChange={(val) =>
              setExpr({
                ...expr,
                source: { type: "variable", name: val },
              })
            }
            options={variables.map((v) => ({
              value: v.name,
              label: `${v.name}${v.description ? ` (${v.description})` : ""}`,
            }))}
          />
          <ShiftBarsEditor
            label="シフト数"
            value={expr.shiftBars}
            onChange={(val) =>
              setExpr({
                ...expr,
                shiftBars: val,
              })
            }
          />
        </div>
      )}

      {expr.type === "scalar_price" && (
        <div className="space-y-2">
          <Select
            fullWidth
            label="価格"
            value={expr.source}
            onChange={(val) => setExpr({ ...expr, source: val as typeof expr.source })}
            options={PRICE_OPTIONS}
          />
          <ShiftBarsEditor
            label="シフト数"
            value={expr.shiftBars}
            onChange={(val) =>
              setExpr({
                ...expr,
                shiftBars: val,
              })
            }
          />
        </div>
      )}

      {expr.type === "indicator" && (
        <div className="space-y-2">
          <Select
            fullWidth
            label="インジケーター"
            value={expr.name}
            onChange={(val) => setExpr({ ...expr, name: val })}
            options={indicators.map((i) => ({ value: i.name, label: i.label }))}
          />
          <Select
            fullWidth
            label="ライン"
            value={expr.lineName}
            onChange={(val) => setExpr({ ...expr, lineName: val })}
            options={lineOptions}
          />
        </div>
      )}

      {expr.type === "binary_op" && (
        <div className="space-y-2 border p-2 rounded">
          <Select
            fullWidth
            label="演算子"
            value={expr.operator}
            onChange={(val) => setExpr({ ...expr, operator: val as typeof expr.operator })}
            options={BINARY_OPERATORS}
          />
          <VariableExpressionEditor
            name={`${name}.left`}
            value={expr.left as unknown as StrategyVariableExpression}
            onChange={(val) => {
              if (val) {
                setExpr({
                  ...expr,
                  left: val as unknown as StrategyVariableExpression,
                });
              }
            }}
          />
          <VariableExpressionEditor
            name={`${name}.right`}
            value={expr.right as unknown as StrategyVariableExpression}
            onChange={(val) => {
              if (val) {
                setExpr({
                  ...expr,
                  right: val as unknown as StrategyVariableExpression,
                });
              }
            }}
          />
        </div>
      )}

      {expr.type === "unary_op" && (
        <div className="space-y-2 border p-2 rounded">
          <Select
            fullWidth
            label="演算子"
            value={expr.operator}
            onChange={(val) => setExpr({ ...expr, operator: val as typeof expr.operator })}
            options={UNARY_OPERATORS}
          />
          <VariableExpressionEditor
            name={`${name}.operand`}
            value={expr.operand as unknown as StrategyVariableExpression}
            onChange={(val) => {
              if (val) {
                setExpr({
                  ...expr,
                  operand: val as unknown as StrategyVariableExpression,
                });
              }
            }}
          />
        </div>
      )}

      {expr.type === "ternary" && (
        <div className="space-y-2 border p-2 rounded">
          <StrategyConditionBuilder
            value={expr.condition as unknown as StrategyCondition}
            onChange={(val) => {
              if (val) {
                setExpr({
                  ...expr,
                  condition: val as StrategyCondition,
                });
              }
            }}
          />
          <VariableExpressionEditor
            name={`${name}.trueExpr`}
            value={expr.trueExpr as unknown as StrategyVariableExpression}
            onChange={(val) => {
              if (val) {
                setExpr({
                  ...expr,
                  trueExpr: val as unknown as StrategyVariableExpression,
                });
              }
            }}
          />
          <VariableExpressionEditor
            name={`${name}.falseExpr`}
            value={expr.falseExpr as unknown as StrategyVariableExpression}
            onChange={(val) => {
              if (val) {
                setExpr({
                  ...expr,
                  falseExpr: val as unknown as StrategyVariableExpression,
                });
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default VariableExpressionEditor;

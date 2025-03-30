import { useState } from "react";
import Select from "../../components/Select";
import Input from "../../components/Input";
import { useIndicatorList, useIndicatorByName } from "./IndicatorProvider";
import { Operand } from "../types";
import NumberInput from "../../components/NumberInput";
import Checkbox from "../../components/Checkbox";

export type OperandSelectorProps = {
  value?: Operand;
  onChange: (value: Operand | undefined) => void;
};

function OperandSelector({ value, onChange }: OperandSelectorProps) {
  const [type, setType] = useState(value?.type);

  return (
    <div className="space-y-2">
      {/* Operand Type 選択 */}
      <Select
        value={type}
        onChange={(val) => setType(val as Operand["type"])}
        options={[
          { value: "price", label: "価格" },
          { value: "indicator", label: "インジケーター" },
          { value: "number", label: "数値" },
        ]}
      />

      {type === "price" && (
        <PriceOperandSelector
          value={value?.type === "price" ? value : undefined}
          onChange={onChange}
        />
      )}
      {type === "indicator" && (
        <IndicatorOperandSelector
          value={value?.type === "indicator" ? value : undefined}
          onChange={onChange}
        />
      )}
      {type === "number" && (
        <NumberOperandSelector
          value={value?.type === "number" ? value : undefined}
          onChange={onChange}
        />
      )}
    </div>
  );
}

type PriceOperandSelectorProps = {
  value?: Extract<Operand, { type: "price" }>;
  onChange: (value: Operand | undefined) => void;
};

function PriceOperandSelector({ value, onChange }: PriceOperandSelectorProps) {
  return (
    <Select
      value={value?.source ?? "close"}
      onChange={(val) => {
        onChange({
          type: "price",
          source: val as Extract<Operand, { type: "price" }>["source"],
        });
      }}
      options={[
        { value: "close", label: "終値" },
        { value: "open", label: "始値" },
        { value: "high", label: "高値" },
        { value: "low", label: "安値" },
        { value: "bid", label: "Bid" },
        { value: "ask", label: "Ask" },
      ]}
    />
  );
}

type IndicatorOperandSelectorProps = {
  value?: Extract<Operand, { type: "indicator" }> & {
    source?: string;
  };
  onChange: (value: Operand | undefined) => void;
};

function IndicatorOperandSelector({
  value,
  onChange,
}: IndicatorOperandSelectorProps) {
  const [indicatorName, setIndicatorName] = useState(value?.name);
  const [indicatorParams, setIndicatorParams] = useState<
    Record<string, string | number | boolean | null>
  >(value?.params || {});
  const [indicatorParamsErrors, setIndicatorParamsErrors] =
    useState<Record<string, string | undefined>>();
  const [indicatorSource, setIndicatorSource] = useState(value?.source);
  const indicator = useIndicatorByName(indicatorName);
  const indicatorList = useIndicatorList();

  const handleParamChange = (
    paramKey: string,
    paramValue: string | number | boolean | null
  ) => {
    const newParams = {
      ...indicatorParams,
      [paramKey]: paramValue,
    };
    setIndicatorParams(newParams);
    if (indicator) {
      const [result, errors] = indicator.validateParams(newParams);
      if (result) {
        onChange({
          type: "indicator",
          name: indicator.name,
          params: newParams,
          source: indicatorSource,
        });
      } else {
        onChange(undefined);
        setIndicatorParamsErrors(errors);
      }
    }
  };
  return (
    <>
      <Select
        value={indicatorName}
        onChange={(val) => {
          setIndicatorName(val);
          setIndicatorParamsErrors(undefined);
          setIndicatorParams({});
          setIndicatorSource(undefined);
        }}
        options={indicatorList.map((ind) => ({
          value: ind.name,
          label: ind.label,
        }))}
      />

      {indicator?.sourceRequired && (
        <Select
          value={value?.source ?? "close"}
          onChange={(val) => {
            setIndicatorSource(
              val as Extract<Operand, { type: "indicator" }>["source"]
            );
            if (value) {
              onChange({
                ...value,
                source: val as Extract<
                  Operand,
                  { type: "indicator" }
                >["source"],
              });
            }
          }}
          options={[
            { value: "close", label: "終値" },
            { value: "open", label: "始値" },
            { value: "high", label: "高値" },
            { value: "low", label: "安値" },
          ]}
        />
      )}

      {indicator?.params?.map((param) =>
        param.type === "number" ? (
          <NumberInput
            key={param.key}
            label={param.label}
            value={value?.params?.[param.key] as number | undefined}
            onChange={(val) => handleParamChange(param.key, val)}
            error={indicatorParamsErrors?.[param.key]}
          />
        ) : param.type === "boolean" ? (
          <Checkbox
            key={param.key}
            label={param.label}
            checked={
              (value?.params?.[param.key] as boolean | undefined) ?? false
            }
            onChange={(val) => handleParamChange(param.key, val)}
            error={indicatorParamsErrors?.[param.key]}
          />
        ) : (
          <Input
            key={param.key}
            placeholder={param.label}
            value={(value?.params?.[param.key] as string | undefined) ?? ""}
            onChange={(val) => handleParamChange(param.key, val)}
            error={indicatorParamsErrors?.[param.key]}
          />
        )
      )}
    </>
  );
}

type NumberOperandSelectorProps = {
  value?: Extract<Operand, { type: "number" }>;
  onChange: (value: Operand | undefined) => void;
};

function NumberOperandSelector({
  value,
  onChange,
}: NumberOperandSelectorProps) {
  return (
    <NumberInput
      type="number"
      placeholder="定数（数値）"
      value={value?.value ?? null}
      onChange={(val) => {
        if (val !== null) {
          onChange({
            type: "number",
            value: val as Extract<Operand, { type: "number" }>["value"],
          });
        } else {
          onChange(undefined);
        }
      }}
    />
  );
}

export default OperandSelector;

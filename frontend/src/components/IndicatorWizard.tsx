import { useState, useEffect } from "react";
import type { Indicator } from "../codegen/dsl/indicator";
import Select from "./Select";
import NumberInput from "./NumberInput";
import Input from "./Input";
import Button from "./Button";

export type IndicatorWizardProps = {
  indicators: Indicator[];
  onSubmit?: (indicator: Indicator, params: Record<string, unknown>, pane?: number) => void;
  enablePaneSelection?: boolean;
};

const SOURCE_OPTIONS = [
  { value: "close", label: "終値" },
  { value: "open", label: "始値" },
  { value: "high", label: "高値" },
  { value: "low", label: "安値" },
  { value: "median", label: "中央値" },
  { value: "typical", label: "典型" },
  { value: "weighted", label: "加重" },
];

function IndicatorWizard({
  indicators,
  onSubmit,
  enablePaneSelection = false,
}: IndicatorWizardProps) {
  const [step, setStep] = useState(0);
  const [selectedName, setSelectedName] = useState("");
  const [params, setParams] = useState<Record<string, unknown>>({});
  const [pane, setPane] = useState(0);

  const selected = indicators.find((i) => i.name === selectedName);

  useEffect(() => {
    if (!selected) return;
    const defaults: Record<string, unknown> = {};
    for (const p of selected.params) {
      if (p.default !== undefined) defaults[p.name] = p.default;
    }
    setParams(defaults);
    setPane(0);
  }, [selected]);

  const handleParamChange = (name: string, value: unknown) => {
    setParams((prev) => ({ ...prev, [name]: value }));
  };

  const renderParamField = (p: Indicator["params"][number]) => {
    const value = params[p.name] as string | number | undefined;
    switch (p.type) {
      case "number":
        return (
          <NumberInput
            key={p.name}
            label={p.label}
            value={Number(value ?? 0)}
            onChange={(v) => handleParamChange(p.name, v)}
          />
        );
      case "source":
        return (
          <Select
            key={p.name}
            label={p.label}
            value={String(value ?? "close")}
            onChange={(v) => handleParamChange(p.name, v)}
            options={SOURCE_OPTIONS}
          />
        );
      default:
        if (p.selectableTypes) {
          return (
            <Select
              key={p.name}
              label={p.label}
              value={String(value ?? "")}
              onChange={(v) => handleParamChange(p.name, v)}
              options={p.selectableTypes.map((t) => ({ value: t, label: t }))}
            />
          );
        }
        return (
          <Input
            key={p.name}
            label={p.label}
            value={String(value ?? "")}
            onChange={(v) => handleParamChange(p.name, v)}
          />
        );
    }
  };

  const handleNext = () => {
    if (!selectedName) return;
    setStep(1);
  };

  const handleBack = () => {
    setStep(0);
  };

  const handleSubmit = () => {
    if (selected && onSubmit) {
      onSubmit(selected, params, pane);
    }
    setStep(0);
    setSelectedName("");
    setParams({});
    setPane(0);
  };

  return (
    <div className="space-y-4">
      {step === 0 && (
        <div className="space-y-2">
          <Select
            label="インジケーター"
            value={selectedName}
            onChange={setSelectedName}
            options={indicators.map((i) => ({ value: i.name, label: i.label }))}
          />
          <Button onClick={handleNext} disabled={!selectedName}>
            次へ
          </Button>
        </div>
      )}
      {step === 1 && selected && (
        <div className="space-y-2">
          {selected.params.map((p) => renderParamField(p))}
          {enablePaneSelection && (
            <Select
              label="表示先"
              value={String(pane)}
              onChange={(v) => setPane(Number(v))}
              options={[
                { value: "0", label: "メインチャート" },
                { value: "1", label: "サブウィンドウ1" },
                { value: "2", label: "サブウィンドウ2" },
                { value: "3", label: "サブウィンドウ3" },
              ]}
            />
          )}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleBack}>
              戻る
            </Button>
            <Button onClick={handleSubmit}>完了</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default IndicatorWizard;

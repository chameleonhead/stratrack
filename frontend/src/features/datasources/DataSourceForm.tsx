import { useCallback } from "react";
import Input from "../../components/Input";
import Select from "../../components/Select";
import Textarea from "../../components/Textarea";
import { useLocalValue } from "../../hooks/useLocalValue";

export type DataFormat = "tick" | "ohlc";
export type VolumeType = "none" | "actual" | "tick";

export type DataSourceFormValue = {
  name?: string;
  symbol?: string;
  timeframe?: string;
  format?: DataFormat;
  volume?: VolumeType;
  description?: string;
};

export type DataSourceFormProps = {
  value?: DataSourceFormValue;
  onChange?: (value: DataSourceFormValue) => void;
  hideSourceFields?: boolean;
};

const TIMEFRAME_OPTIONS = [
  { value: "tick", label: "ティック" },
  { value: "5m", label: "5分足" },
];

const FORMAT_OPTIONS = [
  { value: "tick", label: "Tick" },
  { value: "ohlc", label: "OHLC" },
];

const VOLUME_OPTIONS = [
  { value: "none", label: "なし" },
  { value: "actual", label: "Actual" },
  { value: "tick", label: "Tick Count" },
];

function DataSourceForm({ value, onChange, hideSourceFields = false }: DataSourceFormProps) {
  const [localValue, setLocalValue] = useLocalValue<DataSourceFormValue>({}, value, onChange);

  const handleNameChange = useCallback(
    (v: string) => setLocalValue((cv) => ({ ...cv, name: v })),
    [setLocalValue]
  );
  const handleSymbolChange = useCallback(
    (v: string) => setLocalValue((cv) => ({ ...cv, symbol: v })),
    [setLocalValue]
  );
  const handleTimeframeChange = useCallback(
    (v: string) => setLocalValue((cv) => ({ ...cv, timeframe: v })),
    [setLocalValue]
  );
  const handleDescriptionChange = useCallback(
    (v: string) => setLocalValue((cv) => ({ ...cv, description: v })),
    [setLocalValue]
  );

  return (
    <div className="space-y-4">
      <Input
        label="名称"
        value={localValue.name || ""}
        onChange={handleNameChange}
        required
        fullWidth
      />
      {!hideSourceFields && (
        <>
          <Input
            label="通貨ペア"
            value={localValue.symbol || ""}
            onChange={handleSymbolChange}
            required
            fullWidth
          />
          <Select
            label="時間足"
            value={localValue.timeframe || ""}
            onChange={handleTimeframeChange}
            options={TIMEFRAME_OPTIONS}
            required
            allowEmpty={false}
            fullWidth
          />
          <Select
            label="フォーマット"
            value={localValue.format || ""}
            onChange={(v) => setLocalValue((cv) => ({ ...cv, format: v as DataFormat }))}
            options={FORMAT_OPTIONS}
            required
            allowEmpty={false}
            fullWidth
          />
          <Select
            label="Volume"
            value={localValue.volume || "none"}
            onChange={(v) => setLocalValue((cv) => ({ ...cv, volume: v as VolumeType }))}
            options={VOLUME_OPTIONS}
            fullWidth
          />
        </>
      )}
      <Textarea
        label="説明"
        value={localValue.description || ""}
        onChange={handleDescriptionChange}
        rows={3}
        fullWidth
      />
    </div>
  );
}

export default DataSourceForm;

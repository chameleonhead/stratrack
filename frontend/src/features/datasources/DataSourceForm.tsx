import { useCallback } from "react";
import Input from "../../components/Input";
import Select from "../../components/Select";
import Textarea from "../../components/Textarea";
import { useLocalValue } from "../../hooks/useLocalValue";

export type DataSourceFormValue = {
  name?: string;
  symbol?: string;
  timeframe?: string;
  sourceType?: string;
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

const SOURCE_TYPE_OPTIONS = [
  { value: "dukascopy", label: "Dukascopy" },
  { value: "mt4", label: "MT4" },
  { value: "mt5", label: "MT5" },
  { value: "custom_upload", label: "カスタムアップロード" },
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
  const handleSourceTypeChange = useCallback(
    (v: string) => setLocalValue((cv) => ({ ...cv, sourceType: v })),
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
            label="ソース種別"
            value={localValue.sourceType || ""}
            onChange={handleSourceTypeChange}
            options={SOURCE_TYPE_OPTIONS}
            required
            allowEmpty={false}
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

import { useCallback } from "react";
import Input from "../../components/Input";
import Select from "../../components/Select";
import Textarea from "../../components/Textarea";
import Checkbox from "../../components/Checkbox";
import { useLocalValue } from "../../hooks/useLocalValue";

export type DataSourceFormValue = {
  name?: string;
  symbol?: string;
  timeframe?: string;
  fields?: string[];
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

const FIELD_OPTIONS = [
  { value: "bid", label: "Bid" },
  { value: "ask", label: "Ask" },
  { value: "open", label: "Open" },
  { value: "high", label: "High" },
  { value: "low", label: "Low" },
  { value: "close", label: "Close" },
  { value: "volume", label: "Volume" },
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
  const handleFieldChange = useCallback(
    (field: string, checked: boolean) =>
      setLocalValue((cv) => {
        const set = new Set(cv.fields || []);
        if (checked) set.add(field);
        else set.delete(field);
        return { ...cv, fields: Array.from(set) };
      }),
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
          <fieldset className="space-y-2">
            <legend className="font-bold">Fields</legend>
            {FIELD_OPTIONS.map((o) => (
              <Checkbox
                key={o.value}
                label={o.label}
                value={o.value}
                checked={localValue.fields?.includes(o.value)}
                onChange={(v) => handleFieldChange(o.value, v)}
              />
            ))}
          </fieldset>
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

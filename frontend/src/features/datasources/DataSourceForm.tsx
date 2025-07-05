import { forwardRef, useCallback, useImperativeHandle } from "react";
import { z } from "zod";
import Input from "../../components/Input";
import Select from "../../components/Select";
import Textarea from "../../components/Textarea";
import { useLocalValue } from "../../hooks/useLocalValue";
import { useZodForm } from "../../hooks/useZodForm";

export type DataFormat = "tick" | "ohlc";
export type VolumeType = "none" | "actual" | "tickCount";

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
  { value: "1m", label: "1分足" },
  { value: "5m", label: "5分足" },
  { value: "15m", label: "15分足" },
  { value: "30m", label: "30分足" },
  { value: "1h", label: "1時間足" },
  { value: "2h", label: "2時間足" },
  { value: "4h", label: "4時間足" },
  { value: "1d", label: "日足" },
];

const FORMAT_OPTIONS = [
  { value: "tick", label: "Tick" },
  { value: "ohlc", label: "OHLC" },
];

const VOLUME_OPTIONS = [
  { value: "none", label: "なし" },
  { value: "actual", label: "Actual" },
  { value: "tickCount", label: "Tick Count" },
];

const DATA_SOURCE_SCHEMA = z.object({
  name: z.string({ required_error: "名称は必須です" }).min(1, "名称は必須です"),
  symbol: z
    .string({ required_error: "通貨ペアは必須です" })
    .min(1, "通貨ペアは必須です")
    .optional(),
  timeframe: z.string({ required_error: "時間足は必須です" }).min(1, "時間足は必須です").optional(),
  format: z
    .enum(["tick", "ohlc"], {
      required_error: "フォーマットは必須です",
    })
    .optional(),
  volume: z.enum(["none", "actual", "tickCount"]).optional(),
  description: z.string().optional(),
});

export type DataSourceFormHandle = {
  validate: () => boolean;
};

function DataSourceForm(
  { value, onChange, hideSourceFields = false }: DataSourceFormProps,
  ref: React.ForwardedRef<DataSourceFormHandle>
) {
  const [localValue, setLocalValue] = useLocalValue<DataSourceFormValue>({}, value, onChange);
  const { errors: rawErrors, validate } = useZodForm(DATA_SOURCE_SCHEMA, localValue);
  const errors = hideSourceFields
    ? { ...rawErrors, symbol: undefined, timeframe: undefined, format: undefined }
    : rawErrors;

  useImperativeHandle(ref, () => ({ validate }), [validate]);

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
        error={errors.name}
        fullWidth
      />
      {!hideSourceFields && (
        <>
          <Input
            label="通貨ペア"
            value={localValue.symbol || ""}
            onChange={handleSymbolChange}
            required
            error={errors.symbol}
            fullWidth
          />
          <Select
            label="時間足"
            value={localValue.timeframe || ""}
            onChange={handleTimeframeChange}
            options={TIMEFRAME_OPTIONS}
            required
            allowEmpty={false}
            error={errors.timeframe}
            fullWidth
          />
          <Select
            label="フォーマット"
            value={localValue.format || ""}
            onChange={(v) => setLocalValue((cv) => ({ ...cv, format: v as DataFormat }))}
            options={FORMAT_OPTIONS}
            required
            allowEmpty={false}
            error={errors.format}
            fullWidth
          />
          <Select
            label="Volume"
            value={localValue.volume || "none"}
            onChange={(v) => setLocalValue((cv) => ({ ...cv, volume: v as VolumeType }))}
            options={VOLUME_OPTIONS}
            error={errors.volume}
            fullWidth
          />
        </>
      )}
      <Textarea
        label="説明"
        value={localValue.description || ""}
        onChange={handleDescriptionChange}
        error={errors.description}
        rows={3}
        fullWidth
      />
    </div>
  );
}

export default forwardRef(DataSourceForm);

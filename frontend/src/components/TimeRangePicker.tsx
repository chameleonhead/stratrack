import { cn } from "../utils";
import TimePicker from "./TimePicker";
import { useLocalValue } from "../hooks/useLocalValue";

export type TimeRange = {
  from?: string;
  to?: string;
};

export type TimeRangePickerProps = {
  label: string;
  id?: string;
  name?: string;
  value?: TimeRange;
  onChange?: (value: TimeRange) => void;
  required?: boolean;
  error?: Record<keyof TimeRange, string>;
  fullWidth?: boolean;
};

function TimeRangePicker({
  label,
  id,
  name,
  value,
  onChange,
  required = false,
  error,
  fullWidth = false,
}: TimeRangePickerProps) {
  const [localValueFromTime, setLocalValueFromTime] = useLocalValue(
    "",
    value?.from,
    (newValue: string) => {
      if (onChange) {
        onChange({ from: newValue, to: localValueToTime });
      }
    }
  );
  const [localValueToTime, setLocalValueToTime] = useLocalValue(
    "",
    value?.to,
    (newValue: string) => {
      if (onChange) {
        onChange({ from: localValueFromTime, to: newValue });
      }
    }
  );

  return (
    <div id={id} className={cn(fullWidth ? "w-full" : null, "space-y-1")}>
      {label && <p className="text-sm font-semibold text-gray-800">{label}</p>}
      <div className={cn(fullWidth ? "flex" : "inline-flex", "gap-3")}>
        <TimePicker
          label="開始"
          name={`${name}[from]`}
          value={localValueFromTime}
          onChange={setLocalValueFromTime}
          required={required}
          fullWidth={fullWidth}
        />
        <TimePicker
          label="終了"
          name={`${name}[to]`}
          value={localValueToTime}
          onChange={setLocalValueToTime}
          required={required}
          fullWidth={fullWidth}
        />
      </div>
      {(error?.from || error?.to) && (
        <p className="text-sm text-red-600 font-medium">
          {error?.from}
          {error?.to}
        </p>
      )}
    </div>
  );
}

export default TimeRangePicker;

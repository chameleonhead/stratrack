import { useCallback, useEffect, useState } from "react";
import { cn } from "../utils";
import TimePicker from "./TimePicker";

export type TimeRange = {
  start: string;
  end: string;
};

export type TimeRangePickerProps = {
  label: string;
  id?: string;
  name?: string;
  value?: TimeRange;
  onChange?: (value: TimeRange) => void;
  required?: boolean;
  error?: Record<keyof TimeRange, string>;
  className?: string;
};

function TimeRangePicker({
  label,
  id,
  name,
  value,
  onChange,
  required = false,
  error,
  className,
}: TimeRangePickerProps) {
  const [localValueStartTime, setLocalValueStartTime] = useState(value?.start);
  const [localValueEndTime, setLocalValueEndTime] = useState(value?.end);
  const handleChangeStartTime = useCallback(
    (newValue: string) => {
      if (onChange && localValueEndTime) {
        onChange({ start: newValue, end: localValueEndTime });
      }
      if (typeof value === "undefined") {
        setLocalValueStartTime(newValue);
      }
    },
    [onChange, value, localValueEndTime]
  );
  const handleChangeEndTime = useCallback(
    (newValue: string) => {
      if (onChange && localValueStartTime) {
        onChange({ start: localValueStartTime, end: newValue });
      }
      if (typeof value === "undefined") {
        setLocalValueEndTime(newValue);
      }
    },
    [onChange, value, localValueStartTime]
  );
  useEffect(() => {
    if (typeof value !== "undefined") {
      setLocalValueStartTime(value.start);
      setLocalValueEndTime(value.end);
    }
  }, [value]);

  return (
    <div id={id} className={cn("w-full space-y-1", className)}>
      {label && <p className="text-sm font-semibold text-gray-800">{label}</p>}
      <div className="flex gap-3">
        <div className="w-1/2">
          <TimePicker
            label="開始"
            name={`${name}[start]`}
            value={value?.start || ""}
            onChange={handleChangeStartTime}
            required={required}
            error={error?.start}
          />
        </div>
        <div className="w-1/2">
          <TimePicker
            label="終了"
            name={`${name}[end]`}
            value={value?.end || ""}
            onChange={handleChangeEndTime}
            required={required}
            error={error?.end}
          />
        </div>
      </div>
    </div>
  );
}

export default TimeRangePicker;

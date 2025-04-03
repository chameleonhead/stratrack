import { cn } from "../utils";
import TimePicker from "./TimePicker";

export type TimeRange = {
  start: string;
  end: string;
};

export type TimeRangePickerProps = {
  label?: string;
  value: TimeRange;
  onChange?: (value: TimeRange) => void;
  required?: boolean;
  error?: {
    start?: string;
    end?: string;
  };
  className?: string;
};

function TimeRangePicker({
  label,
  value,
  onChange,
  required = false,
  error,
  className,
}: TimeRangePickerProps) {
  const handleStartChange = (start: string) => {
    onChange?.({ ...value, start });
  };

  const handleEndChange = (end: string) => {
    onChange?.({ ...value, end });
  };

  return (
    <div className={cn("w-full space-y-1", className)}>
      {label && <p className="text-sm font-semibold text-gray-800">{label}</p>}
      <div className="flex gap-3">
        <div className="w-1/2">
          <TimePicker
            label="開始"
            value={value.start}
            onChange={handleStartChange}
            required={required}
            error={error?.start}
          />
        </div>
        <div className="w-1/2">
          <TimePicker
            label="終了"
            value={value.end}
            onChange={handleEndChange}
            required={required}
            error={error?.end}
          />
        </div>
      </div>
    </div>
  );
}

export default TimeRangePicker;

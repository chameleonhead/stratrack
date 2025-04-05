import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "../utils";

export type Weekday = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export type WeekdaySelectorProps = {
  label?: string;
  id?: string;
  name?: string;
  defaultValue?: Weekday[];
  value?: Weekday[];
  onChange?: (selected: string[]) => void;
  error?: string;
  weekdays?: { label: string; value: Weekday }[];
  className?: string;
};

const defaultWeekdays: { label: string; value: Weekday }[] = [
  { label: "日", value: "sun" },
  { label: "月", value: "mon" },
  { label: "火", value: "tue" },
  { label: "水", value: "wed" },
  { label: "木", value: "thu" },
  { label: "金", value: "fri" },
  { label: "土", value: "sat" },
];

export default function WeekdaySelector({
  label,
  id,
  name,
  defaultValue,
  value,
  onChange,
  error,
  weekdays = defaultWeekdays,
  className,
}: WeekdaySelectorProps) {
  // Generate a unique ID if not provided
  const uniqueId = useMemo(
    () => id || `input-${Math.random().toString(36)}`,
    [id]
  );
  const [localValue, setLocalValue] = useState(value || defaultValue || []);
  useEffect(() => {
    if (typeof value !== "undefined") {
      setLocalValue(value);
    }
  }, [value]);

  const toggleDay = useCallback(
    (day: Weekday) => {
      let newSelected: Weekday[];
      if (localValue.includes(day)) {
        newSelected = localValue.filter((d) => d !== day);
      } else {
        newSelected = [...localValue, day];
      }
      if (typeof value === "undefined") {
        setLocalValue(newSelected);
      }
      onChange?.(newSelected);
    },
    [value, localValue, onChange]
  );

  return (
    <div id={uniqueId} className={cn("w-full space-y-1", className)}>
      {label && <p className="text-sm font-semibold text-gray-800">{label}</p>}
      <div className="grid grid-cols-7 gap-2">
        {weekdays.map((day) => (
          <button
            key={day.value}
            type="button"
            name={name}
            onClick={() => toggleDay(day.value)}
            className={cn(
              "py-1 px-2 rounded text-sm font-medium border transition select-none",
              localValue.includes(day.value)
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
            )}
          >
            {day.label}
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
    </div>
  );
}

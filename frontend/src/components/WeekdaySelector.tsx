import { useCallback, useMemo } from "react";
import { cn } from "../utils";
import { useLocalValue } from "../hooks/useLocalValue";
import { Weekday } from "../codegen/dsl/strategy";

export type WeekdaySelectorProps = {
  label?: string;
  id?: string;
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
  defaultValue,
  value,
  onChange,
  error,
  weekdays = defaultWeekdays,
  className,
}: WeekdaySelectorProps) {
  // Generate a unique ID if not provided
  const uniqueId = useMemo(() => id || `input-${Math.random().toString(36)}`, [id]);
  const [localValue, setLocalValue] = useLocalValue(defaultValue || [], value, onChange);

  const toggleDay = useCallback(
    (day: Weekday) => {
      let newSelected: Weekday[];
      if (localValue.includes(day)) {
        newSelected = localValue.filter((d) => d !== day);
      } else {
        newSelected = [...localValue, day];
      }
      setLocalValue(newSelected);
    },
    [localValue, setLocalValue]
  );

  return (
    <div id={uniqueId} className={cn("fieldset", className)}>
      {label && <p className="fieldset-legend">{label}</p>}
      <div className="flex gap-4">
        {weekdays.map((day) => (
          <button
            key={day.value}
            type="button"
            onClick={() => toggleDay(day.value)}
            className={cn("btn grow", localValue.includes(day.value) ? "btn-primary" : "")}
            role="checkbox"
            aria-label={day.label}
          >
            {day.label}
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}

import { cn } from "../utils";

export type WeekdaySelectorProps = {
  value: string[];
  onChange?: (selected: string[]) => void;
  label?: string;
  error?: string;
  weekdays?: { label: string; value: string }[];
  className?: string;
};

const defaultWeekdays = [
  { label: "日", value: "sun" },
  { label: "月", value: "mon" },
  { label: "火", value: "tue" },
  { label: "水", value: "wed" },
  { label: "木", value: "thu" },
  { label: "金", value: "fri" },
  { label: "土", value: "sat" },
];

export default function WeekdaySelector({
  value,
  onChange,
  label,
  error,
  weekdays = defaultWeekdays,
  className,
}: WeekdaySelectorProps) {
  const toggle = (day: string) => {
    const next = value.includes(day)
      ? value.filter((d) => d !== day)
      : [...value, day];
    onChange?.(next);
  };

  return (
    <div className={cn("w-full space-y-1", className)}>
      {label && <p className="text-sm font-semibold text-gray-800">{label}</p>}
      <div className="grid grid-cols-7 gap-2">
        {weekdays.map((day) => (
          <button
            key={day.value}
            type="button"
            onClick={() => toggle(day.value)}
            className={cn(
              "py-1 px-2 rounded text-sm font-medium border transition select-none",
              value.includes(day.value)
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

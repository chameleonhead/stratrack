import TimeRangePicker from "../../components/TimeRangePicker";
import WeekdaySelector from "../../components/WeekdaySelector";
import { useLocalValue } from "../../hooks/useLocalValue";
import { StrategyTemplate, Weekday } from "../types";

export type TimingControlProps = {
  value?: Partial<StrategyTemplate>;
  onChange?: (value: Partial<StrategyTemplate>) => void;
};

const WEEKDAYS = [
  { label: "月", value: "mon" as const },
  { label: "火", value: "tue" as const },
  { label: "水", value: "wed" as const },
  { label: "木", value: "thu" as const },
  { label: "金", value: "fri" as const },
];

function TimingControl({ value, onChange }: TimingControlProps) {
  const [localValue, setLocalValue] = useLocalValue(
    { timingControl: {} },
    value,
    onChange
  );
  return (
    <section id="timing-control" className="space-y-4">
      <h2>時間帯・曜日制限</h2>
      <WeekdaySelector
        label="取引可能曜日"
        value={localValue.timingControl?.allowedDays || []}
        onChange={(selected) => {
          setLocalValue({
            ...value,
            timingControl: {
              ...(localValue.timingControl || {}),
              allowedDays: selected as Weekday[],
            },
          });
        }}
        weekdays={WEEKDAYS}
      />
      <TimeRangePicker
        label="取引可能時間帯"
        value={localValue.timingControl?.allowedTimeRange}
        onChange={(selected) => {
          setLocalValue({
            ...localValue,
            timingControl: {
              ...(localValue.timingControl || {}),
              allowedTimeRange: selected as { from: string; to: string },
            },
          });
        }}
      />
    </section>
  );
}

export default TimingControl;

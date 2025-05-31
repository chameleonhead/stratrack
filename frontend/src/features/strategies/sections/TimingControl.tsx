import Button from "../../../components/Button";
import TimeRangePicker from "../../../components/TimeRangePicker";
import WeekdaySelector from "../../../components/WeekdaySelector";
import { DayAndTimeRange, StrategyTemplate } from "../../../codegen/dsl/strategy";
import { useLocalValue } from "../../../hooks/useLocalValue";

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

function AllowedTradingPeriod({
  value,
  onChange,
}: {
  value: DayAndTimeRange;
  onChange: (value: DayAndTimeRange) => void;
}) {
  return (
    <div>
      <WeekdaySelector
        label="取引可能曜日"
        value={value.day ? [value.day] : []}
        onChange={(selected) => {
          onChange({
            ...value,
            day: selected.filter((s) => s !== value.day)[0],
          } as DayAndTimeRange);
        }}
        weekdays={WEEKDAYS}
      />
      <TimeRangePicker
        label="取引可能時間帯"
        value={value.timeRange}
        onChange={(newvalue) => {
          onChange({
            ...value,
            timeRange: newvalue,
          } as DayAndTimeRange);
        }}
      />
    </div>
  );
}

function TimingControl({ value, onChange }: TimingControlProps) {
  const [localValue, setLocalValue] = useLocalValue(
    { timingControl: { allowedTradingPeriods: [] } },
    value,
    onChange
  );
  const timingControl = localValue.timingControl || {};
  const handleAdd = () => {
    const newperiods = [...(timingControl.allowedTradingPeriods || [])];
    newperiods.push({
      day: undefined,
      timeRange: {},
    } as Partial<DayAndTimeRange> as DayAndTimeRange);
    setLocalValue({
      ...localValue,
      timingControl: { ...timingControl, allowedTradingPeriods: newperiods },
    });
  };
  const handleUpdate = (newvalue: DayAndTimeRange, i: number) => {
    const newperiods = [...(timingControl.allowedTradingPeriods || [])];
    newperiods[i] = newvalue;
    setLocalValue({
      ...localValue,
      timingControl: { ...timingControl, allowedTradingPeriods: newperiods },
    });
  };
  return (
    <section id="timing-control" className="space-y-4">
      <h2>時間帯・曜日制限</h2>
      {localValue.timingControl?.allowedTradingPeriods?.map((p, i) => (
        <AllowedTradingPeriod value={p} onChange={(value) => handleUpdate(value, i)} />
      ))}
      <div>
        <Button onClick={handleAdd}>追加</Button>
      </div>
    </section>
  );
}

export default TimingControl;

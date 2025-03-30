import { useCallback, useEffect, useMemo, useState } from 'react';

type Weekday = '月' | '火' | '水' | '木' | '金' | '土' | '日';

type WeekdaySelectorProps = {
  label: string;
  id?: string;
  name: string;
  defaultSelectedDays?: Weekday[];
  selectedDays?: Weekday[];
  onChange?: (days: Weekday[]) => void;
};

const weekdays: Weekday[] = ['月', '火', '水', '木', '金', '土', '日'];

function WeekdaySelector({
  label,
  id,
  name,
  defaultSelectedDays: defaultValue,
  selectedDays: value = [],
  onChange,
}: WeekdaySelectorProps) {
  // Generate a unique ID if not provided
  const uniqueId = useMemo(
    () => id || `input-${Math.random().toString(36)}`,
    [id]
  );
  const [localValue, setLocalValue] = useState(value || defaultValue || "");
  useEffect(() => {
    if (typeof value !== "undefined") {
      setLocalValue(value);
    }
  }, [value]);

  const toggleDay = useCallback((day: Weekday) => {
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
  }, [localValue, onChange]);

  return (
    <div>
      <label htmlFor={uniqueId}>{label}</label>
      {weekdays.map((day) => (
        <label key={day}>
          <input
            type="checkbox"
            name={name}
            onClick={() => toggleDay(day)}
            checked={localValue.includes(day)}
          />
          {day}
        </label>
      ))}
    </div>
  );
};

export default WeekdaySelector;

import React, { useCallback, useEffect, useMemo, useState } from 'react';

export type TimeRangePickerProps = {
  label: string
  id?: string;
  name: string;
  startTime?: string;
  endTime?: string;
  onChange?: (start: string, end: string) => void;
};

function TimeRangePicker({
  label,
  id,
  name,
  startTime = '',
  endTime = '',
  onChange,
}: TimeRangePickerProps) {
  // Generate a unique ID if not provided
  const uniqueId = useMemo(
    () => id || `input-${Math.random().toString(36)}`,
    [id]
  );
  const [localValueStartTime, setLocalValueStartTime] = useState(startTime);
  const [localValueEndTime, setLocalValueEndTime] = useState(endTime);
  const handleChangeStartTime = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(event.target.value, localValueEndTime);
      }
      if (typeof startTime === "undefined") {
        setLocalValueStartTime(event.target.value);
      }
    },
    [onChange, startTime]
  );
  const handleChangeEndTime = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(localValueStartTime, event.target.value);
      }
      if (typeof startTime === "undefined") {
        setLocalValueEndTime(event.target.value);
      }
    },
    [onChange, startTime]
  );
  useEffect(() => {
    if (typeof startTime !== "undefined") {
      setLocalValueStartTime(startTime);
    }
  }, [startTime]);
  useEffect(() => {
    if (typeof endTime !== "undefined") {
      setLocalValueEndTime(endTime);
    }
  }, [endTime]);

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={uniqueId}>{label}</label>
      <input
        type="time"
        id={uniqueId}
        name={name && `${name}-starttime`}
        value={localValueStartTime}
        onChange={handleChangeStartTime}
        className="border rounded-xl px-3 py-1 text-sm"
      />
      <span className="text-sm">〜</span>
      <input
        type="time"
        name={name && `${name}-endtime`}
        value={localValueEndTime}
        onChange={handleChangeEndTime}
        className="border rounded-xl px-3 py-1 text-sm"
      />
    </div>
  );
};

export default TimeRangePicker;

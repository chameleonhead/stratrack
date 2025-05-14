import { useCallback, useMemo } from "react";
import { cn } from "../utils";
import { useLocalValue } from "../hooks/useLocalValue";

export type TimePickerProps = {
  label?: string;
  id?: string;
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  step?: number; // 秒単位 (例: 60 → 分単位, 1 → 秒単位)
  fullWidth?: boolean;
};

export default function TimePicker({
  label,
  id,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  step = 60,
  fullWidth,
}: TimePickerProps) {
  const uniqueId = useMemo(
    () => id || `timepicker-${Math.random().toString(36).slice(2, 9)}`,
    [id]
  );

  const [localValue, setLocalValue] = useLocalValue("", value, onChange);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalValue(e.target.value);
    },
    [setLocalValue]
  );

  return (
    <div className={cn(fullWidth ? "fieldset" : "")}>
      {label && (
        <label htmlFor={uniqueId} className={cn(fullWidth ? "fieldset-legend" : "label block")}>
          {label}
        </label>
      )}
      <input
        type="time"
        id={uniqueId}
        name={name}
        value={localValue}
        onChange={handleChange}
        required={required}
        step={step}
        placeholder={placeholder}
        className={cn(fullWidth ? "w-full" : null, "input", error ? "input-error" : "")}
      />
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}

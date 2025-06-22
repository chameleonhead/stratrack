import { useCallback, useMemo } from "react";
import { cn } from "../utils";
import { useLocalValue } from "../hooks/useLocalValue";

export type DatePickerProps = {
  label?: string;
  id?: string;
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  fullWidth?: boolean;
};

export default function DatePicker({
  label,
  id,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  fullWidth,
}: DatePickerProps) {
  const uniqueId = useMemo(
    () => id || `datepicker-${Math.random().toString(36).slice(2, 9)}`,
    [id]
  );

  const [localValue, setLocalValue] = useLocalValue("", value, onChange);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
    },
    [setLocalValue]
  );

  return (
    <div className={cn(fullWidth ? "fieldset" : "")}>
      {label && (
        <label className={cn(fullWidth ? "fieldset-legend" : "label block")}>{label}</label>
      )}
      <input
        type="date"
        id={uniqueId}
        name={name}
        value={localValue}
        onChange={handleChange}
        required={required}
        placeholder={placeholder}
        className={cn(fullWidth ? "w-full" : null, "input", error ? "input-error" : "")}
      />
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}

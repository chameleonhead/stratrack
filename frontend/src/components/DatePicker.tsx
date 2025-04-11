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
    <div className={cn(fullWidth ? "w-full" : null, "space-y-1")}>
      {label && (
        <label
          htmlFor={uniqueId}
          className="block text-sm font-semibold text-gray-800"
        >
          {label}
        </label>
      )}
      <input
        type="date"
        id={uniqueId}
        name={name}
        value={localValue}
        onChange={handleChange}
        required={required}
        placeholder={placeholder}
        className={cn(
          fullWidth ? "w-full" : null,
          "px-4 py-2 rounded-lg border text-sm transition-all duration-150",
          "bg-white text-gray-900",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          error
            ? "border-red-500 ring-red-500 focus:ring-red-500"
            : "border-gray-300"
        )}
      />
      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
    </div>
  );
}

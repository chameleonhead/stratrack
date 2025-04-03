import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "../utils";

export type InputProps = {
  label?: string;
  id?: string;
  name?: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  error?: string;
  className?: string;
};

function Input({
  label,
  id,
  name,
  type = "text",
  placeholder,
  defaultValue,
  value,
  onChange,
  required = false,
  error,
  className,
}: InputProps) {
  const uniqueId = useMemo(
    () => id || `input-${Math.random().toString(36).slice(2, 9)}`,
    [id]
  );

  const [localValue, setLocalValue] = useState(value ?? defaultValue ?? "");

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      onChange?.(newValue);

      if (typeof value === "undefined") {
        setLocalValue(newValue);
      }
    },
    [onChange, value]
  );

  useEffect(() => {
    if (typeof value !== "undefined") {
      setLocalValue(value);
    }
  }, [value]);

  return (
    <div className="w-full space-y-1">
      {label && (
        <label
          htmlFor={uniqueId}
          className="block text-sm font-semibold text-gray-800"
        >
          {label}
        </label>
      )}
      <input
        id={uniqueId}
        type={type}
        name={name}
        placeholder={placeholder}
        value={localValue}
        onChange={handleChange}
        required={required}
        className={cn(
          "w-full px-2 py-2 rounded border text-sm transition-all duration-150",
          "bg-white text-gray-900 placeholder-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          error
            ? "border-red-500 ring-red-500 focus:ring-red-500"
            : "border-gray-300",
          className
        )}
      />
      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
    </div>
  );
}

export default Input;

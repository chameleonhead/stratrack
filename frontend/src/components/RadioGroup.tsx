import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "../utils";

export type RadioGroupOption = {
  label: string;
  value: string;
};

export type RadioGroupProps = {
  label?: string;
  id?: string;
  name?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: RadioGroupOption[];
  direction?: "vertical" | "horizontal";
  error?: string;
  className?: string;
};

function RadioGroup({
  label,
  id,
  name,
  defaultValue,
  value,
  onChange,
  options,
  direction = "vertical",
  error,
  className,
}: RadioGroupProps) {
  const uniqueId = useMemo(
    () => id || `radio-${Math.random().toString(36).slice(2, 9)}`,
    [id]
  );

  const [localValue, setLocalValue] = useState(value ?? defaultValue ?? "");

  const handleChange = useCallback(
    (newValue: string) => {
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
    <div id={uniqueId} className={cn("w-full space-y-1", className)}>
      {label && (
        <p
          className="text-sm font-semibold text-gray-800"
          aria-labelledby={uniqueId}
        >
          {label}
        </p>
      )}
      <div
        className={cn(
          "flex",
          direction === "vertical" ? "flex-col gap-2" : "flex-row gap-4"
        )}
      >
        {options.map((opt) => {
          const id = `${name}-${opt.value}`;
          return (
            <div key={opt.value} className="flex items-center space-x-2">
              <input
                type="radio"
                id={id}
                name={name}
                value={opt.value}
                checked={localValue === opt.value}
                onChange={() => handleChange(opt.value)}
                className={cn(
                  "h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500",
                  error ? "border-red-500 focus:ring-red-500" : ""
                )}
              />
              <label
                htmlFor={id}
                className="text-sm text-gray-800 cursor-pointer"
              >
                {opt.label}
              </label>
            </div>
          );
        })}
      </div>
      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
    </div>
  );
}

export default RadioGroup;

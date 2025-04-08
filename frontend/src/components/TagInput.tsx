import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "../utils";

export type TagInputProps = {
  label: string;
  name: string;
  id?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string[];
  value?: string[];
  onChange?: (value: string[]) => void;
  error?: string;
};

function TagInput({
  label,
  name,
  id,
  required,
  placeholder,
  defaultValue,
  value,
  onChange,
  error,
}: TagInputProps) {
  const uniqueId = useMemo(
    () => id || `tag-${Math.random().toString(36).slice(2, 9)}`,
    [id]
  );

  const [localValue, setLocalValue] = useState(value ?? defaultValue ?? []);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
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
    <div className="mb-4">
      <label
        htmlFor={uniqueId}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        name={name}
        id={uniqueId}
        className={cn(
          "w-full px-2 py-2 rounded border text-sm transition-all duration-150",
          "bg-white text-gray-900 placeholder-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          error
            ? "border-red-500 ring-red-500 focus:ring-red-500"
            : "border-gray-300"
        )}
        value={localValue.join(", ")}
        onChange={handleChange}
        placeholder={placeholder}
      />
      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
    </div>
  );
}

export default TagInput;

import { ChangeEvent, useMemo } from "react";
import { cn } from "../utils";
import { useLocalValue } from "../hooks/useLocalValue";

export type SelectProps = {
  label?: string;
  id?: string;
  name?: string;
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  options?: Array<{ value: string; label: string } | string>;
  required?: boolean;
  allowEmpty?: boolean;
  error?: string;
  fullWidth?: boolean;
};

function Select({
  label,
  id,
  name,
  placeholder,
  defaultValue,
  value,
  onChange,
  options = [],
  required = false,
  allowEmpty = true,
  error,
  fullWidth = false,
}: SelectProps) {
  const uniqueId = useMemo(() => id || `select-${Math.random().toString(36).slice(2, 9)}`, [id]);

  const [localValue, setLocalValue] = useLocalValue(defaultValue || "", value, onChange);

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const selectedValue = event.target.value;
    setLocalValue(selectedValue);
  }

  return (
    <div className={cn(fullWidth ? "w-full" : null, "space-y-1")}>
      {label && (
        <label htmlFor={uniqueId} className="block text-sm font-semibold text-gray-800">
          {label}
        </label>
      )}
      <select
        id={uniqueId}
        name={name}
        value={localValue}
        required={required}
        onChange={handleChange}
        className={cn(
          fullWidth ? "w-full" : "",
          "px-4 py-2 rounded-lg border text-sm transition-all duration-150",
          "bg-white text-gray-900 appearance-none",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          error ? "border-red-500 ring-red-500 focus:ring-red-500" : "border-gray-300"
        )}
      >
        {allowEmpty && <option value="">{placeholder || "選択してください"}</option>}
        {options.map((option) =>
          typeof option === "string" ? (
            <option key={option} value={option}>
              {option}
            </option>
          ) : (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          )
        )}
      </select>
      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
    </div>
  );
}

export default Select;

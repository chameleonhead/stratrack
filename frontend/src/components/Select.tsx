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

  const firstOption = useMemo(() => {
    if (options.length === 0) return "";
    const opt = options[0];
    return typeof opt === "string" ? opt : opt.value;
  }, [options]);

  const initialValue = defaultValue ?? (allowEmpty ? "" : firstOption);

  const [localValue, setLocalValue] = useLocalValue(initialValue, value, onChange);

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const selectedValue = event.target.value;
    setLocalValue(selectedValue);
  }

  return (
    <div className={cn(fullWidth ? "fieldset" : "")}>
      {label && (
        <label htmlFor={uniqueId} className={cn(fullWidth ? "fieldset-legend" : "label block")}>
          {label}
        </label>
      )}
      <select
        id={uniqueId}
        name={name}
        value={localValue}
        required={required}
        onChange={handleChange}
        className={cn(fullWidth ? "w-full" : "", "select", error ? "select-error" : "")}
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
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}

export default Select;

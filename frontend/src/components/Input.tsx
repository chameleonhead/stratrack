import { useCallback, useMemo } from "react";
import { cn } from "../utils";
import { useLocalValue } from "../hooks/useLocalValue";

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
  fullWidth?: boolean;
  disabled?: boolean;
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
  fullWidth = false,
  disabled = false,
}: InputProps) {
  const uniqueId = useMemo(() => id || `input-${Math.random().toString(36).slice(2, 9)}`, [id]);

  const [localValue, setLocalValue] = useLocalValue(defaultValue || "", value, onChange);
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setLocalValue(newValue);
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
        id={uniqueId}
        type={type}
        name={name}
        placeholder={placeholder}
        value={localValue}
        onChange={handleChange}
        required={required}
        className={cn(fullWidth ? "w-full" : null, "input", error ? "input-error" : "")}
        disabled={disabled}
      />
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}

export default Input;

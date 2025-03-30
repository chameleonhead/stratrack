import { useCallback, useEffect, useMemo, useState } from "react";

export type InputProps = {
  label: string;
  id?: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
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
}: InputProps) {
  // Generate a unique ID if not provided
  const uniqueId = useMemo(
    () => id || `input-${Math.random().toString(36)}`,
    [id]
  );
  const [localValue, setLocalValue] = useState(value || defaultValue || "");
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(event.target.value);
      }
      if (typeof value === "undefined") {
        setLocalValue(event.target.value);
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
    <div>
      <label htmlFor={uniqueId}>{label}</label>
      <input
        id={uniqueId}
        type={type}
        name={name}
        placeholder={placeholder}
        value={localValue}
        onChange={handleChange}
        required={required}
      />
    </div>
  );
}

export default Input;

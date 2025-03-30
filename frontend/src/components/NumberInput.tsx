import { useCallback, useEffect, useMemo, useState } from "react";

export type NumberInputProps = {
  label?: string;
  id?: string;
  name?: string;
  type?: string;
  placeholder?: string;
  defaultValue?: number;
  value?: number | null;
  onChange?: (value: number | null) => void;
  required?: boolean;
  error?: string;
};

function NumberInput({
  label,
  id,
  name,
  placeholder,
  defaultValue,
  value,
  onChange,
  required = false,
  error,
}: NumberInputProps) {
  // Generate a unique ID if not provided
  const uniqueId = useMemo(
    () => id || `input-${Math.random().toString(36)}`,
    [id]
  );
  const [localValue, setLocalValue] = useState(value || defaultValue || null);
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(event.target.value ? parseFloat(event.target.value) : null);
      }
      if (typeof value === "undefined") {
        setLocalValue(parseFloat(event.target.value) || null);
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
      {label ? <label htmlFor={uniqueId}>{label}</label> : null}
      <input
        id={uniqueId}
        type="numebr"
        name={name}
        placeholder={placeholder}
        value={(localValue && localValue.toString()) || ""}
        required={required}
        onChange={handleChange}
      />
      {error ? <span style={{ color: "red" }}>{error}</span> : null}
    </div>
  );
}

export default NumberInput;

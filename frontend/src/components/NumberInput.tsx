import { useCallback, useEffect, useMemo, useState } from "react";

export type NumberInputProps = {
  label: string;
  id?: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: number;
  value?: number;
  onChange?: (value: number | null) => void;
  required?: boolean;
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
}: NumberInputProps) {
  // Generate a unique ID if not provided
  const uniqueId = useMemo(
    () => id || `input-${Math.random().toString(36)}`,
    [id]
  );
  const [localValue, setLocalValue] = useState(value || defaultValue || "");
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(event.target.value ? parseFloat(event.target.value) : null);
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
        type="numebr"
        name={name}
        placeholder={placeholder}
        value={localValue}
        required={required}
        onChange={handleChange}
      />
    </div>
  );
}

export default NumberInput;

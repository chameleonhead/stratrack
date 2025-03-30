import { useCallback, useEffect, useMemo, useState } from "react";

export type TextareaProps = {
  label: string;
  id?: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (event: string | null) => void;
  required?: boolean;
  rows?: number;
};

function Textarea({
  label,
  id,
  name,
  placeholder,
  defaultValue,
  value,
  onChange,
  required = false,
  rows,
}: TextareaProps) {
  // Generate a unique ID if not provided
  const uniqueId = useMemo(
    () => id || `input-${Math.random().toString(36)}`,
    [id]
  );
  const [localValue, setLocalValue] = useState(value || defaultValue || "");
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (onChange) {
        onChange(event.target.textContent);
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
      <div>
        <textarea
          id={uniqueId}
          name={name}
          placeholder={placeholder}
          value={localValue}
          required={required}
          onChange={handleChange}
          rows={rows}
        />
      </div>
    </div>
  );
}

export default Textarea;

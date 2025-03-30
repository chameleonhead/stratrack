import { useCallback, useEffect, useMemo, useState } from "react";

export type CheckboxProps = {
  label: string;
  id?: string;
  name: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: boolean) => void;
  checked?: boolean;
};

function Checkbox({
  label,
  id,
  name,
  placeholder,
  value,
  onChange,
  checked,
}: CheckboxProps) {
  // Generate a unique ID if not provided
  const uniqueId = useMemo(
    () => id || `Checkbox-${Math.random().toString(36)}`,
    [id]
  );
  const [localValue, setLocalValue] = useState(checked);
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(event.target.checked);
      }
      if (typeof value === "undefined") {
        setLocalValue(event.target.checked);
      }
    },
    [onChange, value]
  );
  useEffect(() => {
    if (typeof checked !== "undefined") {
      setLocalValue(checked);
    }
  }, [checked]);
  return (
    <div>
      <label htmlFor={uniqueId}>
        <input
          id={uniqueId}
          type="checkbox"
          name={name}
          placeholder={placeholder}
          onChange={handleChange}
          checked={localValue}
        />
        {label}
      </label>
    </div>
  );
}

export default Checkbox;

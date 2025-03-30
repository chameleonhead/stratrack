import { ChangeEvent, useMemo } from "react";

export type SelectProps = {
  label?: string;
  id?: string;
  name?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  options?: Array<{ value: string; label: string } | string>;
  required?: boolean;
};

function Select({
  label,
  id,
  name,
  placeholder,
  value,
  onChange,
  options = [],
  required = false,
}: SelectProps) {
  // Generate a unique ID if not provided
  const uniqueId = useMemo(
    () => id || `input-${Math.random().toString(36)}`,
    [id]
  );
  function handleChange(event: ChangeEvent<HTMLSelectElement>): void {
    const selectedValue = event.target.value;
    if (onChange) {
      onChange(selectedValue);
    }
  }

  return (
    <div>
      {label ? <label htmlFor={uniqueId}>{label}</label> : label}
      <div>
        <select
          id={uniqueId}
          name={name}
          value={value}
          required={required}
          onChange={handleChange}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) =>
            typeof option === "string" ? (
              <option key={option} value={option} selected={option === value}>
                {option}
              </option>
            ) : (
              <option
                key={option.value}
                value={option.value}
                selected={option.value === value}
              >
                {option.label}
              </option>
            )
          )}
        </select>
      </div>
    </div>
  );
}

export default Select;

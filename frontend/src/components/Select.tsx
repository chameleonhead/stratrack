import { useMemo } from "react";

export type SelectProps = {
  label: string;
  id?: string;
  name: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
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
  return (
    <div>
      <label htmlFor={uniqueId}>{label}</label>
      <div>
        <select
          id={uniqueId}
          name={name}
          value={value}
          required={required}
          onChange={onChange}
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

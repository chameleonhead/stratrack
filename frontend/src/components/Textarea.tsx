import { useMemo, useCallback } from "react";
import { cn } from "../utils";
import { useLocalValue } from "../hooks/useLocalValue";

export type TextareaProps = {
  label?: string;
  id?: string;
  name?: string;
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  error?: string;
  rows?: number;
  fullWidth?: boolean;
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
  error,
  rows = 4,
  fullWidth = false,
}: TextareaProps) {
  const uniqueId = useMemo(() => id || `textarea-${Math.random().toString(36).slice(2, 9)}`, [id]);
  const [localValue, setLocalValue] = useLocalValue(defaultValue ?? "", value, onChange);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setLocalValue(e.target.value);
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
      <textarea
        id={uniqueId}
        name={name}
        placeholder={placeholder}
        rows={rows}
        required={required}
        value={localValue}
        onChange={handleChange}
        className={cn(fullWidth ? "w-full" : null, "textarea", error ? "textarea-error" : "")}
      />
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}

export default Textarea;

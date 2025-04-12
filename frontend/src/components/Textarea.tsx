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
    <div className={cn(fullWidth ? "w-full" : null, "space-y-1")}>
      {label && (
        <label htmlFor={uniqueId} className="block text-sm font-semibold text-gray-800">
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
        className={cn(
          fullWidth ? "w-full" : null,
          "px-2 py-2 rounded border text-sm transition-all duration-150 resize-y",
          "bg-white text-gray-900 placeholder-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          error ? "border-red-500 ring-red-500 focus:ring-red-500" : "border-gray-300"
        )}
      />
      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
    </div>
  );
}

export default Textarea;

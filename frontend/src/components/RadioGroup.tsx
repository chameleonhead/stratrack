import { useMemo } from "react";
import { cn } from "../utils";
import { useLocalValue } from "../hooks/useLocalValue";

export type RadioGroupOption = {
  label: string;
  value: string;
};

export type RadioGroupProps = {
  label?: string;
  id?: string;
  name?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: RadioGroupOption[];
  direction?: "vertical" | "horizontal";
  error?: string;
  fullWidth?: boolean;
};

function RadioGroup({
  label,
  id,
  name,
  defaultValue,
  value,
  onChange,
  options,
  direction = "vertical",
  error,
  fullWidth = false,
}: RadioGroupProps) {
  const uniqueId = useMemo(() => id || `radio-${Math.random().toString(36).slice(2, 9)}`, [id]);

  const [localValue, setLocalValue] = useLocalValue(defaultValue || "", value, onChange);

  return (
    <div id={uniqueId} className={cn(fullWidth ? "fieldset" : "")}>
      {label && (
        <p className={cn(fullWidth ? "fieldset-legend" : "label block")}>
          {label}
        </p>
      )}
      <div className={cn("flex", direction === "vertical" ? "flex-col gap-2" : "flex-row gap-4")}>
        {options.map((opt) => {
          const id = `${name}-${opt.value}`;
          return (
            <div key={opt.value} className="flex items-center space-x-2">
              <input
                type="radio"
                id={id}
                name={name}
                value={opt.value}
                checked={localValue === opt.value}
                onChange={() => setLocalValue(opt.value)}
                className={cn(
                  "radio",
                  error ? "radio-error" : ""
                )}
              />
              <label htmlFor={id} className="label">
                {opt.label}
              </label>
            </div>
          );
        })}
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}

export default RadioGroup;

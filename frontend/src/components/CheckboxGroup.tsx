import Checkbox from "./Checkbox";
import { cn } from "../utils";
import { useLocalValue } from "../hooks/useLocalValue";

export type CheckboxGroupOption = {
  label: string;
  value: string;
};

export type CheckboxGroupProps = {
  label?: string;
  name?: string;
  options: CheckboxGroupOption[];
  defaultValue?: string[];
  value?: string[];
  onChange?: (value: string[]) => void;
  direction?: "vertical" | "horizontal";
  error?: string;
  fullWidth?: boolean;
};

function CheckboxGroup({
  label,
  name,
  options,
  defaultValue,
  value = [],
  onChange,
  direction = "vertical",
  error,
  fullWidth = false,
}: CheckboxGroupProps) {
  const [localValue, setLocalValue] = useLocalValue(defaultValue || [], value, onChange);
  const handleToggle = (optionValue: string) => {
    const newValue = localValue.includes(optionValue)
      ? localValue.filter((v) => v !== optionValue)
      : [...localValue, optionValue];

    setLocalValue(newValue);
  };

  return (
    <div className={cn(fullWidth ? "fieldset" : "")}>
      {label && (
        <label className={cn(fullWidth ? "fieldset-legend" : "label block")}>{label}</label>
      )}
      <div
        className={cn(
          "flex flex-wrap",
          direction === "vertical" ? "flex-col gap-2" : "flex-row gap-4"
        )}
      >
        {options.map((opt) => (
          <Checkbox
            key={opt.value}
            name={name}
            label={opt.label}
            checked={localValue.includes(opt.value)}
            onChange={() => handleToggle(opt.value)}
          />
        ))}
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}

export default CheckboxGroup;

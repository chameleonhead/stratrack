import Checkbox from "./Checkbox";
import { cn } from "../utils";

export type CheckboxGroupOption = {
  label: string;
  value: string;
};

export type CheckboxGroupProps = {
  label?: string;
  name?: string;
  options: CheckboxGroupOption[];
  value?: string[];
  onChange?: (value: string[]) => void;
  direction?: "vertical" | "horizontal";
  error?: string;
  className?: string;
};

export default function CheckboxGroup({
  label,
  name,
  options,
  value = [],
  onChange,
  direction = "vertical",
  error,
  className,
}: CheckboxGroupProps) {
  const handleToggle = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];

    onChange?.(newValue);
  };

  return (
    <div className={cn("w-full space-y-1", className)}>
      {label && <p className="text-sm font-semibold text-gray-800">{label}</p>}
      <div
        className={cn(
          "flex flex-wrap gap-2",
          direction === "vertical" ? "flex-col" : "flex-row"
        )}
      >
        {options.map((opt) => (
          <Checkbox
            key={opt.value}
            name={name}
            label={opt.label}
            checked={value.includes(opt.value)}
            onChange={() => handleToggle(opt.value)}
          />
        ))}
      </div>
      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
    </div>
  );
}

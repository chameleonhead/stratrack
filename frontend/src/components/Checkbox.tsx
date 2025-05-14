import { useCallback, useMemo } from "react";
import { cn } from "../utils";
import { useLocalValue } from "../hooks/useLocalValue";

export type CheckboxProps = {
  label: string;
  id?: string;
  name?: string;
  value?: string;
  onChange?: (value: boolean) => void;
  checked?: boolean;
  error?: string;
  className?: string;
};

function Checkbox({ label, id, name, value, onChange, checked, error, className }: CheckboxProps) {
  const uniqueId = useMemo(() => id || `checkbox-${Math.random().toString(36).slice(2, 9)}`, [id]);

  const [localValue, setLocalValue] = useLocalValue(false, checked, onChange);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const isChecked = event.target.checked;
      setLocalValue(isChecked);
    },
    [setLocalValue]
  );

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <input
        id={uniqueId}
        name={name}
        value={value}
        type="checkbox"
        checked={localValue}
        onChange={handleChange}
        className={cn(
          "checkbox",
          error ? "checkbox-error" : ""
        )}
      />
      <label htmlFor={uniqueId} className="label">
        {label}
      </label>
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}

export default Checkbox;
